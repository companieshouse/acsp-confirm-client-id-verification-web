import chai from "chai";
import sinon from "sinon";
import app from "./../../../src/app";

describe("routes/companyRouter", () => {

    beforeEach(done => {
        sinon.reset();
        sinon.restore();
        done();
    });

    afterEach(done => {
        sinon.reset();
        sinon.restore();
        done();
    });

    it("should serve up the company create page", () => {
        const slug = "/company/create";
        chai.request(app)
            .get(slug)
            .then((response: any) => {
                chai.expect(response).to.have.status(200);
            });
    });

    it("should serve up the company details page", () => {
        const slug = "/company/details/abc123";
        chai.request(app)
            .get(slug)
            .then((response: any) => {
                chai.expect(response).to.have.status(200);
            });
    });

    it("should fail to serve up an invalid path", () => {
        const slug = "/invalid-route/invalid-path";
        chai.request(app)
            .get(slug)
            .then((response: any) => {
                chai.expect(response).to.have.status(404);
            });
    });
});
