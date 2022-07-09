import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmail } from 'class-validator';
import { isValidObjectId, Model } from 'mongoose';
import { WinstonLogger, WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAccessTokenPayload } from '../../shared/dto/payloads/jwt-access-token.payload';
import { Device, DeviceDocument } from '../../shared/schemas/device.schema';
import {
  SpecialToken,
  SpecialTokenDocument,
} from '../../shared/schemas/special-token.schema';
import { User, UserDocument } from '../../shared/schemas/user.schema';
import { UserModel } from '../models/user.model';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { OtpService } from '../../auth/services/otp.service';
import { JwtOtpTokenPayload } from '../../shared/dto/payloads/jwt-otp-token.payload';
import { JwtSetupPasswordTokenPayload } from '../../shared/dto/payloads/jwt-setup-password-token.payload';
import * as bcrypt from 'bcrypt';
import { ProfileInput } from '../dto/inputs/profile.input';
import { PROVIDER_SPECIAL_TOKEN_ENUM } from '../../shared/enums/provider-special-token.enum';
import { UserRenderService } from './user-render.service';
import { CustomJwtService } from '../../auth/services/custom-jwt.service';
import { AppService } from '../../app.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @InjectModel(SpecialToken.name)
    private readonly specialTokenModel: Model<SpecialTokenDocument>,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly winstonLogger: WinstonLogger,
    private readonly otpService: OtpService,
    private readonly userRenderService: UserRenderService,
    private readonly customJwtService: CustomJwtService,
    private readonly appService: AppService,
  ) {}

  //#region
  /**
   * Get UserModel
   * @param uid is user id client wanna find information
   * @returns {Promise<UserModel>}
   */
  async getUserById(uid?: string): Promise<UserModel | null> {
    // Verify value uid
    if (!uid || !isValidObjectId(uid)) {
      throw new BadRequestException(`Uid is null or format wrong! Uid: ${uid}`);
    }
    // Find information user with user Id in database
    const user = await this.getUserDocument(uid);
    // Render from user document
    return this.userRenderService.renderFromDocument(user);
  }
  //#endregion

  //#region
  /**
   * Get information user model with jwt access token payload
   * @param jwtAccessTokenPayload is access token payload
   * @returns {UserModel}
   */
  getUserByAccessToken(
    jwtAccessTokenPayload: JwtAccessTokenPayload,
  ): UserModel | null {
    // Render from access token payload
    return this.userRenderService.renderFromJwtAccessTokenPayload(
      jwtAccessTokenPayload,
    );
  }
  //#endregion

  //#region
  /**
   * Request delete account required access token
   * @param uid is user Id
   * @param reason is reason delete account
   * @returns {Promise<boolean>}
   */
  async deleteAccount(uid: string, reason: string): Promise<boolean> {
    if (!isValidObjectId(uid)) {
      throw new UnauthorizedException(
        'Access token contain property not valid!',
      );
    }
    // Find information of user with user Id
    const user = await this.getUserDocument(uid);
    // Delete all information contain user, device, special token, card
    await user.delete();
    await this.deviceModel.deleteMany({ uid: uid });
    await this.specialTokenModel.deleteMany({ uid: uid });
    // TODO delete information is card
    this.winstonLogger.warn(reason);
    return true;
  }
  //#endregion

  //#region
  /**
   * Get information of user with email, phone number or user id
   * @param arg is email, user or id of user
   * @returns {UserModel}
   */
  async getUserWithAnyMethod(
    argument?: string,
    countryCode?: CountryCode,
  ): Promise<UserModel | null> {
    if (!argument) {
      throw new BadRequestException('Argument is null!');
    }
    const user: UserDocument = await this.getUserDocument(
      argument,
      countryCode,
    );
    // Render UserModel from user document
    return this.userRenderService.renderFromDocument(user);
  }
  //#endregion

  //#region
  /**
   * Request reset password
   * @param ip
   * @param argument
   * @param countryCode
   * @returns
   */
  async resetPassword(
    ip: string,
    argument?: string,
    countryCode?: CountryCode,
  ): Promise<string | null> {
    if (!argument) {
      throw new BadRequestException('Argument is null!');
    }
    // Find user document
    const user: UserDocument = await this.getUserDocument(
      argument,
      countryCode,
    );
    // Generate otp code & send otp code
    const otpCode = this.otpService.generateOtpCode(6);
    if (user.phoneNumber && user.countryCode) {
      await this.appService.sendOtpCode(
        parsePhoneNumber(user.phoneNumber, user.countryCode as CountryCode)
          .number,
        otpCode,
      );
    }
    // Encrypt Otp code
    const salt: string = await bcrypt.genSalt(10);
    const encryptOtpCode: string = await bcrypt.hash(otpCode, salt);
    // Delete old record token in database
    await this.specialTokenModel.deleteMany({
      uid: user._id,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.RESET_PASSWORD,
    });
    // Create new record token
    const newSpecialToken = new this.specialTokenModel({
      uid: user._id,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.RESET_PASSWORD,
      otpCode: encryptOtpCode,
    });
    const saveSpecialToken: SpecialTokenDocument = await newSpecialToken.save();
    // Return Otp token from payload
    return await this.customJwtService.signSpecialToken<JwtOtpTokenPayload>({
      oid: saveSpecialToken._id,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.RESET_PASSWORD,
      ip: ip,
      uid: user._id,
    });
  }
  //#endregion

  //#region
  /**
   * Return setup password token
   * @param ip ip of request
   * @param otpToken is Otp token after request otp
   * @param otpCode is Otp Code
   * @returns {Promise<string>}
   */
  async verifyOtpTokenResetPassword(
    ip: string,
    otpToken: string,
    otpCode: string,
  ): Promise<string | null> {
    // Verify otp token & return otp token payload
    const jwtOtpTokenPayload: JwtOtpTokenPayload =
      await this.customJwtService.verifySpecialToken<JwtOtpTokenPayload>(
        otpToken,
      );
    // Check action of payload
    if (
      jwtOtpTokenPayload.provider !== PROVIDER_SPECIAL_TOKEN_ENUM.RESET_PASSWORD
    ) {
      throw new BadRequestException('Activity is not allow!');
    }
    // Verify information of payload
    if (
      !isValidObjectId(jwtOtpTokenPayload.oid) ||
      !isValidObjectId(jwtOtpTokenPayload.uid) ||
      jwtOtpTokenPayload.countryCode ||
      jwtOtpTokenPayload.phoneNumber
    ) {
      throw new BadRequestException(
        'OTP token contain property format is wrong!',
      );
    }
    // Find & check record otp token record in database
    const specialToken = await this.specialTokenModel.findById(
      jwtOtpTokenPayload.oid,
    );
    if (!specialToken) {
      throw new UnauthorizedException('OTP token is not valid!');
    }
    // Verify Otp code
    if (!(await bcrypt.compare(otpCode, specialToken.otpCode))) {
      throw new UnauthorizedException('OTP code is wrong!');
    }
    // Check Ip address request & payload
    if (jwtOtpTokenPayload.ip !== ip) {
      throw new BadRequestException('Remote address is wrong!');
    }
    // Verify information of payload(database & payload)
    if (specialToken.uid !== jwtOtpTokenPayload.uid) {
      throw new UnauthorizedException('Warning! Request is danger.');
    }
    // Check record of user
    const user = await this.userModel.findById(jwtOtpTokenPayload.uid);
    if (!user) {
      throw new NotFoundException('User is deleted!');
    }
    // Delete record Otp token
    await specialToken.delete();
    // Create new model & save
    const newSpecialToken = new this.specialTokenModel({
      uid: jwtOtpTokenPayload.uid,
      provider: PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD,
    });
    const saveNewSpecialToken = await newSpecialToken.save();
    // Render token from payload setup password
    return await this.customJwtService.signSpecialToken<JwtSetupPasswordTokenPayload>(
      {
        provider: PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD,
        uid: jwtOtpTokenPayload.uid,
        ip: ip,
        oid: saveNewSpecialToken._id,
      },
    );
  }
  //#endregion

  //#region
  /**
   * Execution setup new password
   * @param ip is Ip address of request
   * @param setupPasswordToken is setup password token after verify otp success!
   * @param password is new password
   * @returns {Promise<boolean>}
   */
  async setupNewPassword(
    ip: string,
    setupPasswordToken: string,
    password: string,
  ): Promise<boolean | null> {
    // Verify setup password token & return payload
    const jwtSetupPasswordPayload: JwtSetupPasswordTokenPayload =
      await this.customJwtService.verifySpecialToken<JwtSetupPasswordTokenPayload>(
        setupPasswordToken,
      );
    // Password length less 6 is weak password!
    if (password.length < 6) {
      throw new BadRequestException('Weak password!');
    }
    // Check information remote address request & in payload
    if (jwtSetupPasswordPayload.ip !== ip) {
      throw new BadRequestException('Remote address is wrong!');
    }
    // Check action
    if (
      jwtSetupPasswordPayload.provider !==
      PROVIDER_SPECIAL_TOKEN_ENUM.SETUP_PASSWORD
    ) {
      throw new BadRequestException('Action not allow!');
    }
    // Check information of payload
    if (
      !isValidObjectId(jwtSetupPasswordPayload.oid) ||
      !isValidObjectId(jwtSetupPasswordPayload.uid)
    ) {
      throw new BadRequestException(
        'Setup password token contain property is not allow!',
      );
    }
    // Find record of token in database
    const specialToken = await this.specialTokenModel.findById(
      jwtSetupPasswordPayload.oid,
    );
    if (!specialToken) {
      throw new UnauthorizedException('Setup password token is not valid!');
    }
    // Find record of user
    const user = await this.getUserDocument(jwtSetupPasswordPayload.uid);
    // Delete special token
    await specialToken.delete();
    // Get salt & encrypt new password with salt
    const salt = await bcrypt.genSalt(10);
    const encryptPwd = await bcrypt.hashSync(password, salt);
    user.password = encryptPwd;
    // Save new password
    user.save();
    return true;
  }
  //#endregion

  //#region
  /**
   * Return UserModel
   * @param jwtAccessTokenPayload
   * @param profile
   * @returns
   */
  async updateProfile(
    jwtAccessTokenPayload: JwtAccessTokenPayload,
    profile: ProfileInput,
  ): Promise<UserModel | null> {
    // Find information of user with user Id
    const user = await this.getUserDocument(jwtAccessTokenPayload.uid);
    // Setup new value from profile input
    user.displayName = profile.displayName ?? user.displayName;
    user.birthDay = profile.birthDay ?? user.birthDay;
    user.bio = profile.bio ?? user.bio;
    user.address = profile.address ?? user.address;
    const saveUser = await user.save();
    // Render from user document
    return this.userRenderService.renderFromDocument(saveUser);
  }
  //#endregion

  //#region
  /**
   * Get user document by email, user name, phone number or user id
   * @param argument
   * @param countryCode
   */
  async getUserDocument(
    argument: string,
    countryCode?: CountryCode,
  ): Promise<UserDocument> {
    let user: UserDocument;
    if (isEmail(argument)) {
      user = await this.userModel.findOne({ email: argument });
    } else if (isValidObjectId(argument)) {
      user = await this.userModel.findById(argument);
    }
    if (!user) {
      try {
        const validPhoneNumber = parsePhoneNumber(argument, countryCode);
        user = await this.userModel.findOne({
          phoneNumber: validPhoneNumber.nationalNumber,
          countryCode: validPhoneNumber.country,
        });
      } catch (exception: any) {
        throw new NotFoundException('Information format is wrong!');
      }
    }
    if (!user) {
      throw new NotFoundException('Not found information of user!');
    }
    return user;
  }
  //#endregion
}
