import mockAuthenticationMiddleware from "./authentication_middleware_mock";
import { mockSessionMiddleware, mockEnsureSessionCookiePresentMiddleware } from "./session_middleware_mock";
import mockAcspAuthenticationMiddleware from "./acsp_authentication_middleware_mock";
import mockCsrfProtectionMiddleware from "./csrf_protection_middleware_mock";
import mockAcspIsActiveMiddleware from "./acsp_is_active_middleware_mock";

export default {
    mockAuthenticationMiddleware,
    mockSessionMiddleware,
    mockEnsureSessionCookiePresentMiddleware,
    mockAcspAuthenticationMiddleware,
    mockCsrfProtectionMiddleware,
    mockAcspIsActiveMiddleware
};
