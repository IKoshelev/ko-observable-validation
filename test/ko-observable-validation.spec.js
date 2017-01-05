describe("ko.validateObservable", function () {
    function expectTrue(val) {
        expect(val).toBe(true);
    }
    it('should exist', function () {
        expect(ko.validateObservable).toBeDefined();
    });
    it('should extend the passed observable and return it', function () {
        var source = ko.observable(1);
        var subj = ko.validateObservable(source, function () { return []; });
        expectTrue(source === subj);
    });
    it('should throw error if validation is added a second time or property names conflict', function () {
        var source = ko.observable(1);
        var subj = ko.validateObservable(source, function () { return []; });
        var hasThrown = false;
        try {
            ko.validateObservable(subj, function () { return []; });
        }
        catch (err) {
            hasThrown = true;
        }
        expectTrue(hasThrown);
        var propNames = ["revalidate", "validationFunction", "forceStateValid"];
        propNames.forEach(function (name) {
            var subj2 = ko.observable(5);
            subj2[name] = function () { };
            var hasThrown = false;
            try {
                ko.validateObservable(subj, function () { return []; });
            }
            catch (err) {
                hasThrown = true;
            }
            expectTrue(hasThrown === true);
        });
    });
    it("should allow preexisting 'validationMessages' property on an observable, but throw if it is not an observable array", function () {
        var source = ko.observable(1);
        source.validationMessages = {};
        var hasThrown = false;
        try {
            ko.validateObservable(source, function () { return []; });
        }
        catch (err) {
            hasThrown = true;
        }
        expectTrue(hasThrown);
        source = ko.observable(1);
        source.validationMessages = ko.observableArray();
        hasThrown = false;
        try {
            ko.validateObservable(source, function () { return []; });
        }
        catch (err) {
            hasThrown = true;
        }
        expectTrue(hasThrown == false);
    });
    it('should accept a non-observable value, wrap  it in observable and proced with that observable', function () {
        var source = ko.observable(1);
        var subj = ko.validateObservable(1, function () { return []; });
        expectTrue(ko.isObservable(subj));
        expectTrue(subj() === 1);
    });
    it('should expose passed validation function as readonly property', function () {
        var fn = function () { return []; };
        var subj = ko.validateObservable(ko.observable(1), fn);
        expectTrue(subj.validationFunction === fn);
    });
    it('should use function passed to validate after first intput', function () {
        var subj = ko.validateObservable(ko.observable(1), function (val) {
            if (val > 0) {
                return [val.toString()];
            }
            return [];
        });
        expectTrue(subj.validationMessages().length === 0);
        subj(2);
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "2");
        subj(1);
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "1");
        subj(0);
        expectTrue(subj.validationMessages().length === 0);
    });
    it('should wrap validate in computed after first input', function () {
        var threshold = ko.observable(10);
        var validateExecutions = 0;
        var subj = ko.validateObservable(ko.observable(1), function (val) {
            validateExecutions += 1;
            if (val > threshold()) {
                return [val.toString()];
            }
            return [];
        });
        expectTrue(subj.validationMessages().length === 0);
        subj(8);
        expectTrue(subj.validationMessages().length === 0);
        threshold(5);
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "8");
        subj(2);
        expectTrue(subj.validationMessages().length === 0);
        expectTrue(validateExecutions === 3);
    });
    it('should allow to trigger validate manually and wrap it in computed at that moment', function () {
        var threshold = ko.observable(10);
        var validateExecutions = 0;
        var subj = ko.validateObservable(ko.observable(20), function (val) {
            validateExecutions += 1;
            if (val > threshold()) {
                return [val.toString()];
            }
            return [];
        });
        expectTrue(subj.validationMessages().length === 0);
        subj.revalidate();
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "20");
        threshold(50);
        expectTrue(subj.validationMessages().length === 0);
        subj(70);
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "70");
        expectTrue(validateExecutions === 3);
    });
    it('should allow to manually set state valid', function () {
        var subj = ko.validateObservable(ko.observable(1), function (val) {
            0;
            if (val > 5) {
                return [val.toString()];
            }
            return [];
        });
        expectTrue(subj.validationMessages().length === 0);
        subj(10);
        expectTrue(subj.validationMessages().length === 1);
        expectTrue(subj.validationMessages()[0] === "10");
        subj.forceStateValid();
        expectTrue(subj.validationMessages().length === 0);
    });
});
//# sourceMappingURL=ko-observable-validation.spec.js.map