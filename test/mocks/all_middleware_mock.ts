import mockAuthenticationMiddleware from "./authentication_middleware_mock";
import mockSessionMiddleware from "./session_middleware_mock";
import mockAcspAuthenticationMiddleware from "./acsp_authentication_middleware_mock";
import mockCsrfProtectionMiddleware from "./csrf_protection_middleware_mock";

export default {
    mockAuthenticationMiddleware,
    mockSessionMiddleware,
    mockAcspAuthenticationMiddleware,
    mockCsrfProtectionMiddleware
};
