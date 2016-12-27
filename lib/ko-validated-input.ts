/// <reference path="../typings/index.d.ts" />

interface InputEventNames{
    viewObsSet:string;
    vmObsSet:string;
    validateFiring:string;
}

type InputEventName= keyof InputEventNames;

type ValidationFunction<Tvm, Tview> 
        = ( vmObs: KnockoutObservable<Tvm>, 
            viewObs: ValidatedInput<Tvm, Tview>, 
            viewValueWasSet: boolean)=>void;

interface ValidatedInput<Tvm, Tview> extends KnockoutObservable<Tview>{
    validationFunction: ValidationFunction<Tvm, Tview>;
    revalidate(): void;
    validationMessages: KnockoutObservableArray<string>;
}

interface ValidatedInputFactory{
    <Tvm, Tview>(vmObs: KnockoutObservable<Tvm>, validate?: ValidationFunction<Tvm, Tview>): ValidatedInput<Tvm, Tview>
}
                

interface KnockoutStatic{
    validatedInput:ValidatedInputFactory
}

(() => {

    var validatedInputFactory = <ValidatedInputFactory> function<Tvm, Tview>(vmObs: KnockoutObservable<Tvm>, 
                 validate: ValidationFunction<Tvm, Tvm|Tview>) :ValidatedInput<Tvm, Tview> {

        if(typeof validate === 'undefined'){
            validate = (vmObs, viewObs, currentCycleLog) => {
                var val = viewObs();
                vmObs(<Tvm>val);
            }
        }
        var viewObs = <ValidatedInput<Tvm, Tview>>ko.observable<Tview>();
        viewObs.validationFunction = validate;
        var manualRevalidaionTrigger = ko.observable().extend({ notify: 'always' });
        viewObs.revalidate = () => {};
        viewObs.validationMessages = ko.observableArray<string>();

        var currentCycleLog:InputEventName[] = [];
        var cycleStopTimeoutHanlde: number | undefined;
        function onCycleEventStarted(currentCycleLog:string[]){
            if(currentCycleLog.length === 0){
                viewObs.validationMessages([]);
            }
            if(cycleStopTimeoutHanlde){
                return;
            }
            cycleStopTimeoutHanlde = setTimeout(()=>{
                cycleStopTimeoutHanlde = undefined;
                currentCycleLog = [];             
            })
        }

        // this function is needed when a cycle is triggered more then once in the save iteration of event loop
        function onNewCycleStarted(){
            currentCycleLog = [];
        }

        function isPrecedingLogEventsASequenceOf(currentCycleLog:InputEventName[], precedingLast:InputEventName, prerecdingBeforeLast: InputEventName){
            var len = currentCycleLog.length;
            if(len < 2){
                return false;
            }
            return currentCycleLog[len - 1] == precedingLast 
                    && currentCycleLog[len - 2] == prerecdingBeforeLast;

        }


        vmObs.subscribe(() => {
            function isLasttEventvalidateStart(){
                return currentCycleLog.length > 0 && currentCycleLog[currentCycleLog.length -1] == 'validateStart';
            }
            if(isLasttEventvalidateStart() == false){
                onNewCycleStarted();
            }
            onCycleEventStarted(currentCycleLog);
            currentCycleLog.push('vmObservableSet');
        });

        viewObs.subscribe(() => {           
            function isLasttEventFormatStart(){
                return currentCycleLog.length > 0 && currentCycleLog[currentCycleLog.length -1] == 'formatStart';
            }
            if(isLasttEventFormatStart() == false){
                onNewCycleStarted();
            }
            onCycleEventStarted(currentCycleLog);
            currentCycleLog.push('viewObservableSet');
            activatevalidateSubscription();
        });

        var revalidationInitialHandle = manualRevalidaionTrigger.subscribe(() => {
            revalidationInitialHandle.dispose();
            activatevalidateSubscription();
        })

        let isvalidateSubscriptionActivated = false;
        function activatevalidateSubscription(){
            if(isvalidateSubscriptionActivated){
                return;
            }
            ko.computed(() => {
                // function isEventDirectlyFollowingFormat(currentCycleLog:InputControllerStageName[]){
                //     return isPrecedingLogEventsASequenceOf(currentCycleLog, "viewObservableSet", "formatTriggered");
                // }
                // if(isvalidateSubscriptionActivated && isEventDirectlyFollowingFormat(currentCycleLog)){
                //     return;
                // }
                manualRevalidaionTrigger();
                onCycleEventStarted(currentCycleLog);
                currentCycleLog.push('validateStart');
                viewObs.validationFunction (vmObs,viewObs, currentCycleLog);
                currentCycleLog.push('validateEnd');
            });
            isvalidateSubscriptionActivated = true;
        }

        return viewObs;
    }

    ko.validatedInput = validatedInputFactory;

})();
