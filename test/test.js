// define(function(require, exports, module) {
// var template = paperclip.template("hello {{ message || 'World' }}! <br /> inline-json {{ {'5+10 is':5+10, 'message is defined?' : message ? 'yes' : 'no' } | json }}");
// var template = paperclip.template("Two-way binding: <input class='form-control' model='{{ <~>name }}' /> Bind input value to name only: <input class='form-control' model='{{ ~>name }}' /> Bind name to input value only: <input class='form-control' model='{{ <~name }}' /> Unbound helper - don't watch for any changes: {{ ~name }}");
var template = paperclip.template("<input type='text' class='form-control' placeholder='Type in a message' onEnter='{{ enterPressed = true }}'></input> {{#if: enterPressed }} enter pressed {{/}}")
console.log(template)
var view = template.view({
    name: "Bill Murray"
});
console.log(view);
document.body.appendChild(view.render()); // will show "hello Bill Murray"
view.bind({ name: "Bill Clinton" });
// });