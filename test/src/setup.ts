import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.use(chaiAsPromised);

// global.Chai = chai;
// (global as any).expect = chai.expect;

process.env.APP_NAME = "node-web-starter-ts";
process.env.LOG_LEVEL = "info";
process.env.NODE_ENV = "dev";
process.env.NODE_PORT = "3000";
process.env.NUNJUCKS_LOADER_WATCH = "false";
process.env.NUNJUCKS_LOADER_NO_CACHE = "true";
process.env.CHS_URL = "http://chsurl.co";

process.env.API_URL = "http://testapi.co";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.COOKIE_DOMAIN = "cookie domain";
process.env.CACHE_SERVER = "test";
