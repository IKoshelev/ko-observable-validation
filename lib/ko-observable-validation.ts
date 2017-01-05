/// <reference path="../typings/index.d.ts" />

type ValidationFunction<T> 
        = ( val:T)=>string[];

interface ObservableWithValidationMessages<T> extends KnockoutObservable<T>{
     validationMessages: KnockoutObservableArray<string>;
}

interface ValidatedObservable<T> extends ObservableWithValidationMessages<T>{
    readonly validationFunction: ValidationFunction<T>;
    revalidate(): void;
    forceStateValid():void;
}

interface ValidationMixin{
    <T>(vmObs: KnockoutObservable<T> | T, validate: ValidationFunction<T>):  ValidatedObservable<T>
}
                

interface KnockoutStatic{
    validateObservable:ValidationMixin
}

ko.validateObservable  = <ValidationMixin> function<T>(initialObsOrValue: ObservableWithValidationMessages<T> | KnockoutObservable<T> | T, 
                validationFunction: ValidationFunction<T>): ValidatedObservable<T> {

    var obs : ValidatedObservable<T>;
    
    if(ko.isObservable(initialObsOrValue)){
        obs = <ValidatedObservable<T>>initialObsOrValue;
    } else {
        obs = <ValidatedObservable<T>>ko.observable(initialObsOrValue);
    }

    if(obs.revalidate || obs.validationFunction || obs.forceStateValid){
        throw new Error("Attempt to add validation to observable that already has it added, or has confliction property names.");
    }

    obs.validationMessages = obs.validationMessages || ko.observableArray<string>();

    function isObservableArrray(obj:any):boolean{
        return ko.isObservable(obj) && ((<any>obj).destroyAll !== undefined);
    }

    if(isObservableArrray(obs.validationMessages) == false){
        throw new Error("observable passed for extension already has a property 'validationMessages' but it is not an observable array.");
    }

    Object.defineProperty(obs,"validationFunction", {
        get: function(){
            return validationFunction;
        }
    })

    function clearValidationMessages(){
        obs.validationMessages([]);
    }

    function setValidationMessages(messages: string[]){
        obs.validationMessages(messages);
    }

    obs.forceStateValid = clearValidationMessages;

    var manualTrigger  = ko.observable().extend({notify:"always"});

    obs.revalidate = function(){
        manualTrigger(manualTrigger());
    }

    var manualTriggerFirstFireSub =  manualTrigger.subscribe(() => {
        ensureActivatedComputedValidaate();
        manualTriggerFirstFireSub.dispose();
    });

    obs.subscribe(() => {
        if(!computedValidateActivated){
            ensureActivatedComputedValidaate();
        } else {
            obs.revalidate();
        }
    });

    var computedValidateActivated = false;
    function ensureActivatedComputedValidaate(){
        if(computedValidateActivated){
            return;
        }

        ko.computed(function(){
            manualTrigger(); // capture dependency
            clearValidationMessages();               
            var val = obs.peek();
            var newValidationMessages = validationFunction(val) || [];
            setValidationMessages(newValidationMessages);
        })

        computedValidateActivated = true;
    }

    return obs;
}