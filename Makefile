artifact_name       := acsp-confirm-client-id-verfication-web
version             := "unversioned"

.PHONY: all
all: build

.PHONY: clean
clean:
		rm -f ./$(artifact_name)-*.zip
		rm -rf ./build-*
		rm -rf ./dist
		rm -f ./build.log

package-install:
	npm install

.PHONY: build
build:	
		npm ci
		npm run build

.PHONY: lint
lint:
		npm run lint

.PHONY: sonar
sonar:
		npm run sonarqube

.PHONY: test-unit
test-unit:
		npm run test:coverage

.PHONY: test
test: test-unit 

.PHONY: security-check
security-check:
		npm audit --audit-level=high

.PHONY: package
package: build
ifndef version
		$(error No version given. Aborting)
endif
		$(info Packaging version: $(version))
		$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
		cp -r ./dist $(tmpdir)
		cp -r ./assets $(tmpdir)
		cp -r ./locales $(tmpdir)
		cp -r ./package.json $(tmpdir)
		cp -r ./package-lock.json $(tmpdir)
		cd $(tmpdir) && npm install --production && npm update
		rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
		cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
		rm -rf $(tmpdir)

.PHONY: dist
dist: lint test-unit clean package
