/* eslint-env node, mocha */
const { expect } = require('chai');
const Wrapper = require('noflo-wrapper');
const { resolve } = require('path');

describe('Assembly Graph', function bar() {
  this.timeout(5000);
  let c;

  describe('A simple pipeline graph', () => {
    before((done) => {
      c = new Wrapper('example/BuildChassis', {
        baseDir: resolve(__dirname, '../example'),
        debug: true,
      });
      c.start(done);
    });
    after(() => c.dumpTrace());

    it('should build a car chassis', (done) => {
      c.receive('out', (msg) => {
        expect(msg).to.be.an('object');
        expect(msg.errors).to.have.lengthOf(0);
        expect(msg.id).to.equal(123);
        expect(msg.chassis).to.be.an('object');
        expect(msg.chassis.id).to.equal(msg.id);
        expect(msg.chassis.frame).to.equal('Steel Frame');
        expect(msg.chassis.engine).to.equal('Mercedes V8 5.0');
        expect(msg.chassis.transmission).to.equal('ZF Automatic 6-speed');
        expect(msg.chassis.driveShaft).to.be.ok;
        expect(msg.chassis.suspension).to.be.an('object');
        expect(msg.chassis.wheels).to.have.lengthOf(4);
        done();
      });

      // Place an order message
      const msg = {
        errors: [],
        id: 123,
      };

      c.send({ in: msg });
    });
  });

  describe('A graph with branches', () => {
    before((done) => {
      c = new Wrapper('example/BuildBody', {
        baseDir: resolve(__dirname, '../example'),
        debug: true,
      });
      c.start(done);
    });
    after(() => c.dumpTrace());

    it('should build a car body', (done) => {
      c.receive('out', (msg) => {
        expect(msg).to.be.an('object');
        expect(msg.errors).to.have.lengthOf(0);
        expect(msg.id).to.equal(123);
        expect(msg.body).to.be.an('object');
        expect(msg.body.id).to.equal(msg.id);
        expect(msg.body.panels).to.be.ok;
        expect(msg.body.interior).to.be.ok;
        expect(msg.body.doors).to.have.lengthOf(4);
        expect(msg.body.electrics).to.be.ok;
        done();
      });

      // Place an order message
      const msg = {
        errors: [],
        id: 123,
      };

      c.send({ in: msg });
    });
  });

  describe('A top level graph with subgraphs', () => {
    before((done) => {
      c = new Wrapper('example/BuildCar', {
        baseDir: resolve(__dirname, '../example'),
        debug: true,
      });
      c.start(done);
    });
    after(() => c.dumpTrace());

    it('should build a car', (done) => {
      c.receive('out', (msg) => {
        if (msg.errors.length) {
          msg.errors.forEach((err) => {
            console.log(err);
          });
        }
        expect(msg).to.be.an('object');
        expect(msg.errors).to.have.lengthOf(0);
        expect(msg.id).to.equal(1);
        expect(msg.chassis).to.be.an('object');
        expect(msg.body).to.be.an('object');
        // expect(msg.parts).to.be.undefined;
        done();
      });

      // Place an order message
      c.send({ in: true });
    });
  });
});
