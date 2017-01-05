ko.validateObservable = function (initialObsOrValue, validationFunction) {
    var obs;
    if (ko.isObservable(initialObsOrValue)) {
        obs = initialObsOrValue;
    }
    else {
        obs = ko.observable(initialObsOrValue);
    }
    if (obs.revalidate || obs.validationFunction || obs.forceStateValid) {
        throw new Error("Attempt to add validation to observable that already has it added, or has confliction property names.");
    }
    obs.validationMessages = obs.validationMessages || ko.observableArray();
    function isObservableArrray(obj) {
        return ko.isObservable(obj) && (obj.destroyAll !== undefined);
    }
    if (isObservableArrray(obs.validationMessages) == false) {
        throw new Error("observable passed for extension already has a property 'validationMessages' but it is not an observable array.");
    }
    Object.defineProperty(obs, "validationFunction", {
        get: function () {
            return validationFunction;
        }
    });
    function clearValidationMessages() {
        obs.validationMessages([]);
    }
    function setValidationMessages(messages) {
        obs.validationMessages(messages);
    }
    obs.forceStateValid = clearValidationMessages;
    var manualTrigger = ko.observable().extend({ notify: "always" });
    obs.revalidate = function () {
        manualTrigger(manualTrigger());
    };
    var manualTriggerFirstFireSub = manualTrigger.subscribe(function () {
        ensureActivatedComputedValidaate();
        manualTriggerFirstFireSub.dispose();
    });
    obs.subscribe(function () {
        if (!computedValidateActivated) {
            ensureActivatedComputedValidaate();
        }
        else {
            obs.revalidate();
        }
    });
    var computedValidateActivated = false;
    function ensureActivatedComputedValidaate() {
        if (computedValidateActivated) {
            return;
        }
        ko.computed(function () {
            manualTrigger();
            clearValidationMessages();
            var val = obs.peek();
            var newValidationMessages = validationFunction(val) || [];
            setValidationMessages(newValidationMessages);
        });
        computedValidateActivated = true;
    }
    return obs;
};
//# sourceMappingURL=ko-observable-validation.js.map