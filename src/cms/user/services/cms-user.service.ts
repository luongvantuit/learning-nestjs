import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CmsUserFindArg } from '../../../cms/dto/args/cms-user-find.arg';
import { User, UserDocument } from '../../../shared/schemas/user.schema';
import { CmsUserModel } from '../models/cms-user.model';
import { Model } from 'mongoose';
import { AuthResultBaseModel } from '../../../auth/models/auth-result-base.model';
import { CmsUserMatchQuery } from '../../../shared/querys/cms-user-match.query';
import { SORT_ENUM } from '../../../shared/enums/sort.enum';

@Injectable()
export class CmsUserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async cmsUserFind(cmsUserFindArg: CmsUserFindArg): Promise<CmsUserModel> {
    const countDocument: number = await this.userModel.countDocuments();
    const length: number = cmsUserFindArg.length || 10;
    const totalPage: number = Math.round(countDocument / length);
    const page: number = cmsUserFindArg.page || 0;
    const currentPage: number = page < totalPage ? page : 0;

    const cmsUserMatchQuery: CmsUserMatchQuery = {};
    if (cmsUserFindArg.email) {
      cmsUserMatchQuery.email = {
        $regex: cmsUserFindArg.email,
        $options: 'i',
      };
    }
    if (cmsUserFindArg.phoneNumber) {
      cmsUserMatchQuery.phoneNumber = {
        $regex: cmsUserFindArg.phoneNumber,
        $options: 'i',
      };
    }
    if (cmsUserFindArg.countryCode) {
      cmsUserMatchQuery.countryCode = {
        $regex: cmsUserFindArg.countryCode,
        $options: 'i',
      };
    }
    if (cmsUserFindArg.createAt) {
      cmsUserMatchQuery.createAt = {
        $regex: cmsUserFindArg.createAt,
        $options: 'i',
      };
    }
    if (cmsUserFindArg.displayName) {
      cmsUserMatchQuery.displayName = {
        $regex: cmsUserFindArg.displayName,
        $options: 'i',
      };
    }
    if (cmsUserFindArg.userName) {
      cmsUserMatchQuery.userName = {
        $regex: cmsUserFindArg.userName,
        $options: 'i',
      };
    }

    const cmsUserSortQuery: any = {};
    if (cmsUserFindArg.sortByEmail) {
      if (cmsUserFindArg.sortByEmail === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.email = 1;
      } else if (cmsUserFindArg.sortByEmail === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.email = -1;
      }
    }
    if (cmsUserFindArg.sortByPhoneNumber) {
      if (cmsUserFindArg.sortByPhoneNumber === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.phoneNumber = 1;
      } else if (cmsUserFindArg.sortByPhoneNumber === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.phoneNumber = -1;
      }
    }
    if (cmsUserFindArg.sortByCountryCode) {
      if (cmsUserFindArg.sortByCountryCode === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.countryCode = 1;
      } else if (cmsUserFindArg.sortByCountryCode === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.countryCode = -1;
      }
    }
    if (cmsUserFindArg.sortByCreateAt) {
      if (cmsUserFindArg.sortByCreateAt === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.createAt = 1;
      } else if (cmsUserFindArg.sortByCreateAt === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.createAt = -1;
      }
    }
    if (cmsUserFindArg.sortByDisplayName) {
      if (cmsUserFindArg.sortByDisplayName === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.displayName = 1;
      } else if (cmsUserFindArg.sortByDisplayName === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.displayName = -1;
      }
    }
    if (cmsUserFindArg.sortByUserName) {
      if (cmsUserFindArg.sortByUserName === SORT_ENUM.ASCENDING) {
        cmsUserSortQuery.userName = 1;
      } else if (cmsUserFindArg.sortByUserName === SORT_ENUM.DESCENDING) {
        cmsUserSortQuery.userName = -1;
      }
    }

    const query: any[] = [
      {
        $match: cmsUserMatchQuery,
      },
      {
        $project: {
          uid: '$_id',
          isVerify: '$isVerify',
          email: '$email',
          phoneNumber: '$phoneNumber',
          provider: '$provider',
          displayName: '$provider',
          createAt: '$createAt',
          address: '$address',
          bio: '$bio',
          photoAvatar: '$photoAvatar',
          photoCover: '$photoCover',
          birthDay: '$birthDay',
          userName: '$userName',
          countryCode: '$countryCode',
        },
      },
      { $skip: currentPage * length },
      {
        $limit: length,
      },
    ];

    let users: AuthResultBaseModel[];
    try {
      const sortQuery: any[] = [
        ...query,
        {
          $sort: cmsUserSortQuery,
        },
      ];
      users = <AuthResultBaseModel[]>await this.userModel.aggregate(sortQuery);
    } catch (error) {
      users = <AuthResultBaseModel[]>await this.userModel.aggregate(query);
    }

    return {
      items: users,
      totalPage: totalPage,
      currentPage: currentPage,
      hasNext: currentPage < totalPage,
    };
  }
}
