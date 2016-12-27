describe("ko.inputController", function () {
    it('should exist', function () {
        expect(ko.inputController).toBeDefined();
    });
    it('should return a new observable bound to existing one, if no parse\format passed', function () {
        var source = ko.observable(1);
        var input = ko.inputController(source);
        expect(input()).toBe(1);
        source(2);
        expect(input()).toBe(2);
        input(3);
        expect(source()).toBe(3);
    });
    it('should use parse and format functions passed', function () {
        var source = ko.observable(1);
        var input = ko.inputController(source, function (vm, view) {
            var val = view();
            var parsed = parseInt(val);
            vm(parsed);
        }, function (vm, view) {
            var val = vm();
            var formatted = val.toString();
            view(formatted);
        });
        expect(input() === "1").toBe(true);
        source(2);
        expect(input() === "2").toBe(true);
        input("3");
        expect(source() === 3).toBe(true);
    });
    it('should clear validationMessages at the begining of the cycle', function () {
        var source = ko.observable(1);
        var input = ko.inputController(source, function (vm, view) {
            var val = view();
            var parsed = parseInt(val);
            if (parsed > 2) {
                view.validationMessages.push("MARKER");
            }
            vm(parsed);
        }, function (vm, view) {
            var val = vm();
            var formatted = val.toString();
            view(formatted);
        });
        expect(input() === "1").toBe(true);
        expect(input.validationMessages.length === 0).toBe(true);
        source(2);
        expect(input() === "2").toBe(true);
        expect(input.validationMessages().length === 0).toBe(true);
        input("3");
        expect(source() === 3).toBe(true);
        expect(input.validationMessages().length === 1).toBe(true);
        expect(input.validationMessages()[0] === "MARKER").toBe(true);
        input("4");
        expect(source() === 4).toBe(true);
        expect(input.validationMessages().length === 1).toBe(true);
        expect(input.validationMessages()[0] === "MARKER").toBe(true);
        input("2");
        expect(source() === 2).toBe(true);
        expect(input.validationMessages().length === 0).toBe(true);
    });
    fit('should wrap parse in computed', function () {
        var multiplier = ko.observable(10);
        var source = ko.observable(1);
        var input = ko.inputController(source, function (vm, view) {
            var val = view();
            vm(val * multiplier());
        });
        expect(input() === 1).toBe(true);
        expect(source() === 1).toBe(true);
        input(2);
        expect(input() === 2).toBe(true);
        expect(source() === 20).toBe(true);
        multiplier(100);
        expect(input() === 2).toBe(true);
        expect(source() === 200).toBe(true);
    });
    it('should wrap format in computed', function (done) {
        var suffix = ko.observable('a');
        var source = ko.observable(1);
        var input = ko.inputController(source, undefined, function (vm, view) {
            var val = vm();
            var formatted = val.toString();
            view(formatted + suffix());
        });
        expect(input() === '1a').toBe(true);
        expect(source() === 1).toBe(true);
        source(2);
        expect(input() === '2a').toBe(true);
        suffix('aa');
        setTimeout(function () {
            suffix('aaa');
            expect(input() === '2aaa').toBe(true);
            done();
        }, 100);
    });
    xit('test', function () {
        var a = ko.observable(1);
        var b = ko.observable(0);
        var c = ko.computed(function () {
            console.log("c pre");
            b(a());
            console.log("c post");
        });
        var d = ko.computed(function () {
            console.log("d pre");
            a(b());
            console.log("d post");
        });
        console.log("start");
        a(2);
        console.log('end');
    });
    xit('test2', function () {
        var a = ko.observable(1);
        var c = true;
        var b = ko.computed(function () {
            console.log('b');
            if (c) {
                return a();
            }
        });
        a(2);
        c = false;
        a(3);
        a(4);
    });
});
//# sourceMappingURL=ko-validated-input.js.map