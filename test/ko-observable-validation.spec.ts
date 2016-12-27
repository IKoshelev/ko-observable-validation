/// <reference path="../typings/index.d.ts" />


describe("ko.validateObservable",()=>{
		
function expectTrue(val: boolean){
	expect(val).toBe(true);
}

	it('should exist',()=>{
		expect(ko.validateObservable).toBeDefined();
	});

	it('should extend the passed observable and return it',() => {
		
		var source = ko.observable(1);
		var subj = ko.validateObservable<number>(source, () => []);

		expectTrue(source === subj);
		
	});

	it('should accept a non-observable value, wrap  it in observable and proced with that observable',() => {
		
		var source = ko.observable(1);
		var subj = ko.validateObservable<number>(1, () => []);

		expectTrue(ko.isObservable(subj));
		expectTrue(subj() === 1);
		
	});

	it('should expose passed validation function as readonly property',() => {	

		var fn: ValidationFunction<number> = () => [];

		var subj = ko.validateObservable<number>( ko.observable(1), fn);

		expectTrue(subj.validationFunction === fn);
	});

	it('should use function passed to validate after first intput',() => {
		
		var subj = ko.validateObservable<number>( ko.observable(1), 
		(val) => {
			if(val > 0){
				return [val.toString()]
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

	it('should wrap validate in computed after first input',() => {
		
		var threshold = ko.observable(10);
		var validateExecutions = 0;

		var subj = ko.validateObservable<number>(ko.observable(1), 
		(val) => {
			validateExecutions += 1;
			if(val > threshold()){
				return [val.toString()]
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

	it('should allow to trigger validate manually and wrap it in computed at that moment',() => {
		
		var threshold = ko.observable(10);
		var validateExecutions = 0;

		var subj = ko.validateObservable<number>(ko.observable(20), 
		(val) => {
			validateExecutions += 1;
			if(val > threshold()){
				return [val.toString()]
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

	it('should allow to manually set state valid',() => {

		var subj = ko.validateObservable<number>(ko.observable(1), 
		(val) => {0
			if(val > 5){
				return [val.toString()]
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