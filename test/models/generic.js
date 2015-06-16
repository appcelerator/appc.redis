var async = require('async'),
    common = require('../common'),
    should = require('should'),
    TestModel;

describe('generic model', function() {

    before(function() {
        TestModel = common.Arrow.Model.extend('testBase', {
            fields:{
                fname:{
                    type: String, required: false
                },
                lname:{
                    type: String, required: false
                },
                age:{
                    type: Number, required: false
                }
            },
            connector: 'appc.redis'
        });
    });

    describe('#create', function(){

        it('should create instances', function(next) {

            var fname = 'Hello world',
                lname = 'Test';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function(err, instance) {
                should(err).not.be.ok;
                should(instance).be.an.Object;
                should(instance.getPrimaryKey()).be.a.String;
                should(instance.fname).equal(fname);
                should(instance.lname).equal(lname);
                next();
            });

        });

        it('should create multiple instances', function(next) {

            var fname = 'Hello world',
                lname = 'Test';

            TestModel.create([
                {
                    fname: fname,
                    lname: lname
                },
                {
                    fname: fname,
                    lname: lname
                }
            ], function(err, instances) {
                should(err).not.be.ok;
                should(instances).be.an.Array;
                should(instances).have.length(2);

                should(instances[0].getPrimaryKey()).be.a.String;
                should(instances[0].fname).equal(fname);
                should(instances[0].lname).equal(lname);

                should(instances[1].getPrimaryKey()).be.a.String;
                should(instances[1].fname).equal(fname);
                should(instances[1].lname).equal(lname);

                next();
            });

        });

    });

    describe('#findOne', function(){

        it('should handle bad ids', function(next) {
            TestModel.findOne('a_bad_id', function(err) {
                should(err).be.ok;
                next();
            });
        });

        it('should find an instance by ID', function(next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function(err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                var id = createdInstance.getPrimaryKey();
                TestModel.findOne(id, function(err, foundInstance) {
                    should(err).not.be.ok;
                    should(foundInstance).be.an.Object;

                    should(foundInstance.getPrimaryKey()).equal(id);
                    should(foundInstance.fname).equal(fname);
                    should(foundInstance.lname).equal(lname);

                    next();
                });

            });

        });

        it('should handle bad values', function(next) {

            TestModel.findOne({
                random: {
                    field: 1
                }
            }, function(err) {
                should(err).be.ok;
                should(err.message.indexOf('Unexpected value for findOne')).be.greaterThan(-1);

                next();
            });

        });

    });

    describe('#find', function() {

        it('should find a single instance', function (next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                var id = createdInstance.getPrimaryKey();

                TestModel.find({
                    fname: fname
                }, function (err, collection) {
                    should(err).not.be.ok;
                    should(collection).be.an.Array;

                    var foundInstance = collection[0];

                    should(foundInstance.getPrimaryKey()).equal(id);
                    should(foundInstance.fname).equal(fname);
                    should(foundInstance.lname).equal(lname);

                    next();
                });

            });

        });

        it('should find multiple instances', function (next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance1) {
                should(err).not.be.ok;
                should(createdInstance1).be.an.Object;

                TestModel.create({
                    fname: fname,
                    lname: lname
                }, function (err, createdInstance2) {
                    should(err).not.be.ok;
                    should(createdInstance2).be.an.Object;

                    TestModel.find({
                        fname: fname
                    }, function (err, collection) {
                        should(err).not.be.ok;
                        should(collection).be.an.Array;

                        should(collection).have.length(2);
                        should(collection[0].fname).equal(fname);
                        should(collection[0].lname).equal(lname);
                        should(collection[1].fname).equal(fname);
                        should(collection[1].lname).equal(lname);

                        next();
                    });

                });

            });

        });

        it('should limit instances', function (next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance1) {
                should(err).not.be.ok;
                should(createdInstance1).be.an.Object;

                TestModel.create({
                    fname: fname,
                    lname: lname
                }, function (err, createdInstance2) {
                    should(err).not.be.ok;
                    should(createdInstance2).be.an.Object;

                    TestModel.find({
                        limit: 1,
                        order: {
                            fname: 1
                        },
                        where: {
                            fname: fname
                        }
                    }, function (err, foundInstance) {
                        should(err).not.be.ok;
                        should(foundInstance).be.an.Object;

                        should(foundInstance.fname).equal(fname);
                        should(foundInstance.lname).equal(lname);

                        next();
                    });

                });

            });

        });

        it('should limit fields using sel', function (next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                TestModel.find({
                    limit: 1,
                    sel: {
                        fname: 1
                    },
                    where: {
                        lname: lname
                    }
                }, function (err, foundInstance) {
                    should(err).not.be.ok;
                    should(foundInstance).be.an.Object;

                    should(foundInstance.fname).equal('James');
                    should(foundInstance.lname).not.be.ok;

                    next();
                });

            });

        });

        it('should limit fields using unsel', function (next) {

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                TestModel.find({
                    limit: 1,
                    unsel: {
                        lname: 1
                    },
                    where: {
                        lname: lname
                    }
                }, function (err, foundInstance) {
                    should(err).not.be.ok;
                    should(foundInstance).be.an.Object;

                    should(foundInstance.fname).equal('James');
                    should(foundInstance.lname).not.be.ok;

                    next();
                });

            });

        });

    });

    describe('#findAll', function() {

        it('should find all instances', function(next) {

            var fname = 'James',
                lname = 'Smith';

            var count = 0;

            async.whilst(
                function () { return count < 100; },
                function (callback) {
                    count++;
                    TestModel.create({
                        fname: fname + count,
                        lname: lname + count
                    }, function(err, record){
                        should(err).not.be.ok;
                        should(record).be.an.Object;
                        callback();
                    });
                },
                function (err) {
                    should(err).not.be.ok;

                    TestModel.count(function(err, count){
                        should(err).not.be.ok;
                        should(count).be.an.Number;

                        should(count).eql(100);

                        TestModel.findAll(function(err, collection){
                            should(err).not.be.ok;
                            should(collection).be.an.Array;

                            should(collection).have.lengthOf(100);

                            next();
                        });
                    });
                }
            );

        });

        it('should limit to 1000 instances', function(next) {

            var fname = 'James',
                lname = 'Smith';

            var count = 0;

            async.whilst(
                function () { return count < 1010; },
                function (callback) {
                    count++;
                    TestModel.create({
                        fname: fname + count,
                        lname: lname + count
                    }, function(err, record){
                        should(err).not.be.ok;
                        should(record).be.an.Object;
                        callback();
                    });
                },
                function (err) {
                    should(err).not.be.ok;

                    TestModel.count(function(err, count){
                        should(err).not.be.ok;
                        should(count).be.an.Number;

                        should(count).eql(1010);

                        TestModel.findAll(function(err, collection){
                            should(err).not.be.ok;
                            should(collection).be.an.Array;

                            should(collection).have.lengthOf(1000);

                            next();
                        });
                    });
                }
            );

        });

    });

    describe('#delete and #deleteAll', function() {

        it('should remove an instance', function(next){

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                TestModel.findAll(function (err, collection1) {
                    should(err).not.be.ok;
                    should(collection1).be.an.Array;

                    should(collection1.length).equal(1);
                    should(collection1[0].fname).equal(fname);
                    should(collection1[0].lname).equal(lname);

                    collection1[0].delete(function(){

                        TestModel.findAll(function (err, collection2) {
                            should(err).not.be.ok;
                            should(collection2).be.an.Array;

                            should(collection2.length).equal(0);

                            next();

                        });

                    });

                });

            });

        });

        it('should remove all instances', function(next){

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance1) {
                should(err).not.be.ok;
                should(createdInstance1).be.an.Object;

                TestModel.create({
                    fname: fname,
                    lname: lname
                }, function (err, createdInstance2) {
                    should(err).not.be.ok;
                    should(createdInstance2).be.an.Object;

                    TestModel.findAll(function (err, collection1) {
                        should(err).not.be.ok;
                        should(collection1).be.an.Array;

                        should(collection1.length).equal(2);

                        TestModel.deleteAll(function(){

                            TestModel.findAll(function (err, collection2) {
                                should(err).not.be.ok;
                                should(collection2).be.an.Array;

                                should(collection2.length).equal(0);

                                next();

                            });

                        });

                    });

                });

            });

        });

    });

    describe('#save', function(){

        it('should update an instance', function(next){

            var fname = 'James',
                lname = 'Smith';

            TestModel.create({
                fname: fname,
                lname: lname
            }, function (err, createdInstance) {
                should(err).not.be.ok;
                should(createdInstance).be.an.Object;

                TestModel.findAll(function (err, collection1) {
                    should(err).not.be.ok;
                    should(collection1).be.an.Array;

                    should(collection1.length).equal(1);
                    should(collection1[0].fname).equal(fname);
                    should(collection1[0].lname).equal(lname);

                    collection1[0].set('lname', 'Jameson');

                    collection1[0].save(function(){

                        TestModel.findAll(function (err, collection2) {
                            should(err).not.be.ok;
                            should(collection2).be.an.Array;

                            should(collection2.length).equal(1);
                            should(collection2[0].fname).equal(fname);
                            should(collection2[0].lname).equal('Jameson');

                            next();

                        });

                    });

                });

            });

        });

    });

    afterEach(function(next){
        TestModel.deleteAll(function(err){
            if(err){
                return next(err);
            }
            TestModel.getConnector().client['flushdb'](next);
        });
    });

});