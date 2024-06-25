import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { IAccessToken, ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";

export const userMail = "userWithPermission@ch.gov.uk";
export const ACCESS_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.AccessToken]: "accessToken" };
export const REFRESH_TOKEN_MOCK: IAccessToken = { [AccessTokenKeys.RefreshToken]: "refreshToken" };

const SIGN_IN_INFO = {
    [SignInInfoKeys.SignedIn]: 1,
    [SignInInfoKeys.UserProfile]: { [UserProfileKeys.Email]: userMail },
    [SignInInfoKeys.AccessToken]: {
        ...ACCESS_TOKEN_MOCK,
        ...REFRESH_TOKEN_MOCK
    }
};

export function getSessionRequestWithPermission (): Session {
    return new Session({
        [SessionKey.SignInInfo]: SIGN_IN_INFO as ISignInInfo
    });
}
