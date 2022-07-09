import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountArg } from '../dto/args/account.arg';
import { AuthResultModel } from '../models/auth-result.model';
import { DecodeAccessTokenModel } from '../models/decode-access-token.model';
import { isValidObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import { Model } from 'mongoose';
import { JwtRefreshTokenPayload } from '../../shared/dto/payloads/jwt-refresh-token.payload';
import { CountryCode, parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import { OtpService } from './otp.service';
import { JwtOtpTokenPayload } from '../../shared/dto/payloads/jwt-otp-token.payload';
import {
  SpecialToken,
  SpecialTokenDocument,
} from '../../shared/schemas/special-token.schema';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtSetupPasswordTokenPayload } from '../../shared/dto/payloads/jwt-setup-password-token.payload';
import { Device, DeviceDocument } from '../../shared/schemas/device.schema';
import { isEmail } from 'class-validator';
import { PROVIDER_SPECIAL_TOKEN_ENUM } from '../../shared/enums/provider-special-token.enum';
import { CustomJwtService } from './custom-jwt.service';
import { AuthRenderService } from './auth-render.service';
import { PROVIDER_AUTH_ENUM } from '../../shared/enums/provider-auth.enum';
import { AppService } from '../../app.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(SpecialToken.name)
    private readonly specialTokenModel: Model<SpecialTokenDocument>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
    private readonly customJwtService: CustomJwtService,
    private readonly otpService: OtpService,
    private readonly authRenderService: AuthRenderService,
    private readonly appService: AppService,
  ) {}

  //#region
  /**
   * Request sign in with phone number, email or user name with password
   * Return otp token if device not allow
   * @param ip Ip address of request
   * @param account Information of user submit from client
   * @returns {Promise<AuthResultModel>}
   */
  async signInWithAnyMethod(
    ip: string,
    account?: AccountArg,
  ): Promise<AuthResultModel | null> {
    if (!account) {
      throw new BadRequestException('Information of account is null!');
    }
    let user: UserDocument;
    // If account.user is email find record with email
    if (isEmail(account.user)) {
      user = await this.userModel.findOne({ email: account.user });
    }
    // If user is null find with user name
    if (!user) {
      user = await this.userModel.findOne({
        userName: account.user,
      });
    }
    // If user is null try again with type phone number
    if (!user) {
      try {
        const validPhoneNumber = parsePhoneNumber(
          account.user,
          account.countryCode,
        );
        user = await this.userModel.findOne({
          phoneNumber: validPhoneNumber.nationalNumber,
          countryCode: validPhoneNumber.country,
        });
      } catch (exception: any) {
        throw new NotFoundException('Format phone number is wrong!');
      }
    }
    // If user is null throw exception not found information
    if (!user) {
      throw new NotFoundException('Not found information or account!');
    }
    // Valid password of user
    if (!(await this.verifyPassword(user._id, account.password))) {
      throw new UnauthorizedException('Password is wrong!');
    }
    // Get information device with uid & ip
    const device = await this.deviceModel.findOne({ ip: ip, uid: user._id });
    // If not found information of user or device not allow return otp token
    if (!device || !device.allow) {
      // Generate Otp code & send Otp code
      const otpCode = this.otpService.generateOtpCode(6);
      if (user.phoneNumber && user.countryCode) {
        await this.appService.sendOtpCode(
          parsePhoneNumber(user.phoneNumber, user.countryCode as CountryCode)
            .number,
          otpCode,
        );
      }
      this.winstonLogger.warn(otpCode);
      // Encrypt Otp code
      const salt: string = await bcrypt.genSalt(10);
      const encryptOtpCode: string = await bcrypt.hashSync(otpCode, salt);
      // Delete all old otp token in record of database
      await this.specialTokenModel.deleteMany({
        provider: PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_IN,
        uid: user._id,
      });
      // Create new record otp token
      const otpTokenModel = new this.specialTokenModel({
        provider: PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_IN,
        uid: user._id,
        otpCode: encryptOtpCode,
      });
      const saveOtpTokenModel = await otpTokenModel.save();
      // Remote otp token
      return {
        otpToken:
          await this.customJwtService.signSpecialToken<JwtOtpTokenPayload>({
            ip: ip,
            uid: user._id,
            oid: saveOtpTokenModel._id,
            provider: PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_IN,
          }),
      };
    }
    // Return AuthResultModel if device is allow
    return await this.authRenderService.render(user, device);
  }
  //#endregion

  //#region
  /**
   * Return information AuthResultModel if verify otp is success!
   * @param ip Ip address in request
   * @param userAgent user agent of user
   * @param otpToken is otp token when
   * @param otpCode Otp code submit from client
   * @returns {Promise<AuthResultModel>}
   */
  async verifyOtpTokenSignInWithAnyMethod(
    ip: string,
    userAgent: string,
    otpToken: string,
    otpCode: string,
  ): Promise<AuthResultModel | null> {
    // Verify token & and return payload Otp
    const jwtOtpTokenPayload: JwtOtpTokenPayload =
      await this.customJwtService.verifySpecialToken<JwtOtpTokenPayload>(
        otpToken,
      );
    // Check Ip of request with Ip in token
    if (ip !== jwtOtpTokenPayload.ip) {
      throw new BadRequestException('Remote address is wrong!');
    }
    // Check record of token in database
    if (!isValidObjectId(jwtOtpTokenPayload.oid)) {
      throw new BadRequestException('Payload contain value can not valid!');
    }
    const specialTokenModel = await this.specialTokenModel.findById(
      jwtOtpTokenPayload.oid,
    );
    if (!specialTokenModel) {
      throw new UnauthorizedException(
        `OTP token is valid! OTP token ${otpToken}`,
      );
    }
    // Verify Otp code
    if (!(await bcrypt.compare(otpCode, specialTokenModel.otpCode))) {
      throw new UnauthorizedException(`OTP code is wrong!`);
    }
    // Check action of token
    if (jwtOtpTokenPayload.provider !== PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_IN) {
      throw new BadRequestException('Activity is not allow!');
    }
    await specialTokenModel.delete();
    // Get information device
    let device = await this.deviceModel.findOne({
      uid: jwtOtpTokenPayload.uid,
      ip: ip,
    });
    if (!device) {
      // Create new record device if not existed
      const newDevice = new this.deviceModel({
        uid: jwtOtpTokenPayload.uid,
        ip: ip,
        userAgent: userAgent,
        allow: true,
      });
      device = await newDevice.save();
    } else {
      device.allow = true;
      device = await device.save();
    }
    // Check record user existed in record of database
    const user = await this.userModel.findById(jwtOtpTokenPayload.uid);
    if (!user) {
      throw new NotFoundException('Not found information of user!');
    }
    // return AuthResultModel
    return await this.authRenderService.render(user, device);
  }
  //#endregion

  //#region
  /**
   * Function refresh token return new access token
   * @param ip Ip address of user
   * @param refToken refresh token submit from client
   * @returns {Promise<string>}
   */
  async refreshToken(ip: string, refToken?: string): Promise<string | null> {
    if (!refToken) {
      throw new UnauthorizedException('Refresh token is null!');
    }
    // Verify refresh token & return refresh token payload
    const jwtRefreshTokenPayload: JwtRefreshTokenPayload =
      await this.customJwtService.verifyRefreshToken(refToken);
    // Check information in payload
    if (
      !isValidObjectId(jwtRefreshTokenPayload.uid) ||
      !isValidObjectId(jwtRefreshTokenPayload.deviceId)
    ) {
      throw new BadRequestException('Payload format wrong!');
    }
    // Get user check user existed in record of database
    const user = await this.userModel.findById(jwtRefreshTokenPayload.uid);
    if (!user) {
      throw new NotFoundException('Not found information of user!');
    }
    // Get device information check device is allow
    const device = await this.deviceModel.findById(
      jwtRefreshTokenPayload.deviceId,
    );
    if (!device || !device.allow) {
      throw new UnauthorizedException(
        "Can't refresh token by device is not allow!",
      );
    }
    // Check remote address in request and database
    if (ip !== device.ip) {
      throw new BadRequestException('Remote address is wrong!');
    }
    // Return new access token sign with user document
    return await this.customJwtService.signAccessTokenByDocument(user);
  }
  //#endregion

  //#region
  /**
   * Function verify access token return information encode from access token
   * @param accessToken Access token submit from client
   * @returns {Promise<DecodeAccessTokenModel>}
   */
  async verifyAccessToken(
    accessToken?: string,
  ): Promise<DecodeAccessTokenModel | null> {
    if (!accessToken) {
      throw new UnauthorizedException('Access token is null!');
    }
    // Return decode verify access token
    return (await this.customJwtService.verifyAccessToken(
      accessToken,
    )) as DecodeAccessTokenModel;
  }
  //#endregion

  //#region function sign up with phone number
  /**
   * Request sign up new account with phone number return token & send otp code to phone number
   * @param phoneNumber is phone number sample +849393993932
   * @param countryCode country code submit from client
   * @param ip remote address of request
   * @returns {Promise<string>}
   */
  async signUpWithPhoneNumber(
    phoneNumber?: string,
    countryCode?: CountryCode,
    ip?: string,
  ): Promise<string | null> {
    let convertPhoneNumber: PhoneNumber;
    try {
      convertPhoneNumber = parsePhoneNumber(phoneNumber, countryCode);
    } catch (exception) {
      throw new BadRequestException(
        `Format phone number wrong! Phone number: ${phoneNumber}, country code: ${countryCode}`,
      );
    }
    // Find information user of phone number assigned throw new exception
    const user = await this.userModel.findOne({
      phoneNumber: convertPhoneNumber.nationalNumber,
      countryCode: convertPhoneNumber.country,
    });
    if (user) {
      throw new BadRequestException(
        `Phone number is existed in record! Phone number: ${phoneNumber}`,
      );
    }
    // Generate Otp code with length is 6 & send Otp code with twilio
    const otpCode = this.otpService.generateOtpCode(6);
    await this.appService.sendOtpCode(convertPhoneNumber.number, otpCode);
    // Encrypt Otp code with salt
    const salt: string = await bcrypt.genSalt(10);
    const encryptOtpCode: string = await bcrypt.hash(otpCode, salt);
    // Delete old record Otp token in database
    await this.specialTokenModel.deleteMany({
      phoneNumber: convertPhoneNumber.nationalNumber,
      countryCode: convertPhoneNumber.country,
    });
    // Create new model otp token & save to database
    const otpToken = new this.specialTokenModel({
      phoneNumber: convertPhoneNumber.nationalNumber,
      countryCode: convertPhoneNumber.country,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_UP,
      otpCode: encryptOtpCode,
    });
    const saveOtpToken = await otpToken.save();
    // Sign new token with otp token payload
    return await this.customJwtService.signSpecialToken<JwtOtpTokenPayload>({
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_UP,
      oid: saveOtpToken._id,
      ip: ip,
      countryCode: convertPhoneNumber.country,
      phoneNumber: convertPhoneNumber.nationalNumber,
    });
  }
  //#endregion

  //#region
  /**
   * Verify Otp when sign up new account with phone number
   * @param ip Ip address of client request
   * @param otpToken Otp token when client after request sign up with phone number
   * @param otpCode Otp code submit from client
   * @returns {Promise<string>}
   */
  async verifyOtpTokenSignUpWithPhoneNumber(
    ip: string,
    otpToken: string,
    otpCode: string,
  ): Promise<string | null> {
    // Verify otp token return payload of otp token
    const jwtOtpTokenPayload: JwtOtpTokenPayload =
      await this.customJwtService.verifySpecialToken<JwtOtpTokenPayload>(
        otpToken,
      );
    // Check ip address of request with ip address in payload token
    if (ip != jwtOtpTokenPayload.ip) {
      throw new BadRequestException('Remote address is bad!');
    }
    // Check token in record of database & check Id
    if (!isValidObjectId(jwtOtpTokenPayload.oid)) {
      throw new BadRequestException('OTP token contain otp token id wrong!');
    }
    const otpTokenModel = await this.specialTokenModel.findById(
      jwtOtpTokenPayload.oid,
    );
    if (!otpTokenModel) {
      throw new UnauthorizedException('OTP token is not valid!');
    }
    // Verify Otp code with encrypt code in record of database
    if (!(await bcrypt.compare(otpCode, otpTokenModel.otpCode))) {
      throw new BadRequestException('OTP code is wrong!');
    }
    // Verify action of token(sign up)
    if (
      jwtOtpTokenPayload.provider !== PROVIDER_SPECIAL_TOKEN_ENUM.SIGN_UP ||
      jwtOtpTokenPayload.uid
    ) {
      throw new BadRequestException('Activity is not allow!');
    }
    // Check information decode from otp token with information of record in database
    if (
      otpTokenModel.countryCode !== jwtOtpTokenPayload.countryCode ||
      otpTokenModel.phoneNumber !== jwtOtpTokenPayload.phoneNumber ||
      otpTokenModel.provider !== jwtOtpTokenPayload.provider
    ) {
      throw new BadRequestException('Decode information in token is wrong!');
    }
    // Delete record of token
    await otpTokenModel.delete();
    // Create new record setup password token
    const setupPasswordTokenModel = new this.specialTokenModel({
      phoneNumber: jwtOtpTokenPayload.phoneNumber,
      countryCode: jwtOtpTokenPayload.countryCode,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD,
    });
    const saveSetupPasswordTokenModel = await setupPasswordTokenModel.save();
    // Return sign new token from payload of setup password token
    return await this.customJwtService.signSpecialToken<JwtSetupPasswordTokenPayload>(
      {
        ip: ip,
        phoneNumber: jwtOtpTokenPayload.phoneNumber,
        countryCode: jwtOtpTokenPayload.countryCode,
        provider: PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD,
        oid: saveSetupPasswordTokenModel._id,
      },
    );
  }
  //#endregion

  //#region
  /**
   * Handler setup password when user wanna sign up with phone number
   * @param ip Ip address of user
   * @param userAgent information user agent of user
   * @param setupPasswordToken setup password token submit for client
   * @param password password user wanna setup
   * @returns {Promise<AuthResultModel>}
   */
  async setupPasswordForSignUpWithPhoneNumber(
    ip: string,
    userAgent: string,
    setupPasswordToken: string,
    password: string,
  ): Promise<AuthResultModel | null> {
    // Verify setup password get payload from token
    const jwtSetupPasswordPayload: JwtSetupPasswordTokenPayload =
      await this.customJwtService.verifySpecialToken<JwtSetupPasswordTokenPayload>(
        setupPasswordToken,
      );
    // Check ip address from submit
    if (ip != jwtSetupPasswordPayload.ip) {
      throw new BadRequestException('Remote address is wrong!');
    }
    // Check opt code record (SpecialToken) is format & existed in record of database
    if (!isValidObjectId(jwtSetupPasswordPayload.oid)) {
      throw new BadRequestException(
        'Decode setup password contain property format wrong!',
      );
    }
    const specialTokenModel = await this.specialTokenModel.findById(
      jwtSetupPasswordPayload.oid,
    );
    if (!specialTokenModel) {
      throw new UnauthorizedException('Setup password token is not valid!');
    }
    // Check information decode from token with information of user in database
    if (
      specialTokenModel.phoneNumber !== jwtSetupPasswordPayload.phoneNumber ||
      specialTokenModel.countryCode !== jwtSetupPasswordPayload.countryCode ||
      specialTokenModel.provider !== jwtSetupPasswordPayload.provider
    ) {
      throw new BadRequestException('Decode information in token wrong!');
    }
    // Check length of password if length less 6 throw bad request password is weak
    if (password.length < 6) {
      throw new BadRequestException('Weak password!');
    }
    // Check action is setup password
    if (
      jwtSetupPasswordPayload.provider !==
        PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD ||
      jwtSetupPasswordPayload.uid
    ) {
      throw new BadRequestException('Activity is not allow!');
    }
    // Check record information user if existed throw exception bad request
    const user = await this.userModel.findOne({
      phoneNumber: jwtSetupPasswordPayload.phoneNumber,
      countryCode: jwtSetupPasswordPayload.countryCode,
    });
    if (user) {
      throw new BadRequestException(
        `User is existed in record! Phone number: ${jwtSetupPasswordPayload.phoneNumber}, country code: ${jwtSetupPasswordPayload.countryCode}`,
      );
    }
    // Delete record special token in database
    await specialTokenModel.delete();
    // Hash code password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    // Create new record user
    const newUser = new this.userModel({
      phoneNumber: jwtSetupPasswordPayload.phoneNumber,
      countryCode: jwtSetupPasswordPayload.countryCode,
      password: bcryptPassword,
      createAt: Date.now(),
      provider: PROVIDER_AUTH_ENUM.PASSWORD,
    });
    const saveNewUser = await newUser.save();
    // Create new record information device
    const newDevice = new this.deviceModel({
      uid: saveNewUser._id,
      ip: ip,
      userAgent: userAgent,
      allow: true,
    });
    const saveNewDevice = await newDevice.save();
    // return AuthResultModel
    return await this.authRenderService.render(saveNewUser, saveNewDevice);
  }
  //#endregion

  //#region
  /**
   * Verify password with user corresponding
   * @param uid user id wanna check
   * @param password password input submit from client
   * @returns {Promise<boolean>} true if password is correct
   */
  async verifyPassword(uid?: string, password?: string): Promise<boolean> {
    if (!isValidObjectId(uid)) {
      return false;
    }
    // Get record of user with Id
    const user: UserDocument = await this.userModel.findById(uid);
    return await bcrypt.compare(password, user.password);
  }
  //#endregion
}
