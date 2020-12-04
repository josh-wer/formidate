
# Formidate

[![Build Status](https://travis-ci.com/josh-wer/formidate.svg?branch=master)](https://travis-ci.com/josh-wer/formidate)
[![Coverage Status](https://coveralls.io/repos/github/josh-wer/formidate/badge.svg?branch=master)](https://coveralls.io/github/josh-wer/formidate?branch=master)
[![npm](https://img.shields.io/npm/v/formidate)](https://www.npmjs.com/package/formidate)

Formidate is a form validation library, for validating web client forms.

## Introduction

Formidate was created to give an effective yet convenient way of validating forms in web projects. The library is flexible and gives you control of its effects including what errors are shown, styling, and flow.
_Scroll to the bottom of this page to see a sample react component with form validation_

## Installation

    npm install formidate
Formidate is also available [jsDelivr](https://www.jsdelivr.com) via https://cdn.jsdelivr.net/gh/josh-wer/formidate@x.x.x/dist/formidate.min.js . Replace x.x.x with a version.

## Dependency

Formidate uses [validate.js](https://github.com/ansman/validate.js) behind the scence for its validation rules and is shipped together with the library.

## Usage

### Validating forms

- **Import Formidate to your js code**

```javascript
import Formidate from 'formidate';
```

- **Create a constant as a reference to Formidate FormGroup**

```javascript
const group = Formidate.group(<controls>, <prependName>);
```

> **controls** is an object of all validation controls created with `Formidate.control(<rules>, <defaultValue>);`

```javascript
const controls = {
  username: Formidate.control(Formidate.rules().required()),
  password: Formidate.control(
    Formidate.rules().required().minLength(8),
  ),
};
```

> **prependName** _(optional)_ is a boolean which indicates if that the control name should be prepended to the error messages or not, this is `true` by default. You can still prevent the name from being prepended even if set to true by prepending `^` to the error message.

> **Note**: Formidate uses [validate.js](https://github.com/ansman/validate.js) under the hood and all rules are abstractions of the library, access validate.js docs [here](https://validatejs.org/#validators). Formidate provides **custom** and **customAsync** as additional rules. Also all the rules are accessed as methods using Formidate as shown the the example

### custom and customAsync constriants
custom and customAsync rules both take a function with arguments `(value, values, controlName)`

with the custom rule, validation is based on your specified conditions, simply return a `string` of the error message if validation fails or null if validation passes. The `custom` rule can be used on a control not associated with any input, provided it is the only rule specified on the control

customAsync rule makes you perform validation asynchronously, this is useful if you need to call endpoint or perform some other asynchronous task to validate a field. To do this, customAsync should return a function taking resolve as an argument, resolve should be called to indicate validation is done passing in the validation error `string` or without any argument if the validation passes.

**Sample custom and customAsync rules are shown below**

```javascript
const controls = {
  username: Formidate.control(
    Formidate.rules().customAsync((value, values, controlName) => {
        return (resolve) => {
          if ((value || "").trim() === "") return resolve();

          setTimeout(() => {
            if (["joshua", "john", "rita"].includes(value)) {
              resolve("%{value} is taken");
            } else {
              resolve();
            }
          }, 1000);
        };
      })
  ),
  unique: Formidate.control(
    Formidate.rules().custom((value, values, controlName) => {
      if (values.username === values.password) {
        return "^the username and password cannot be thesame";
      }
      return null;
    })
  ),
};
```

### Using the validator

Ensure the name of the input field corresponds to the object key of the validation control otherwise, the validator control would not be associated with an input field and would be discarded unless it meets the condition to act as a stand-alone custom validator as stated above.

```javascript
<input type="text" name="username" />
```

If for any reason the name given to the input does not match the validation constraint key, use the `formidate-control` or `data-formidate-control` attribute on the input element to specify the constrian key the input is associated with.

```javascript
<input type="text" name="alt-input-name" formidate-control="username" />
```

> Formidate FormGroup instance has a controls property `validator.controls` that holds the control object of each field. The control object has three important fields
>
> - **errors** - an array holding all validation errors of the field
> - **touched** - indicating if the control field has been interacted with
> - **loading** - indicating if an asynchronous validation is processing

getting a reference to a control associated with a field can be done thus

```javascript
const usernameControl = validator.controls.username;
// OR
const usernameControl = validator.get('username');
```

The errors, touched, loading and other properties and methods of the control can be access from the control object directly

```javascript
const usernameErrors = validator.controls.username.errors;

const usernameTouched = validator.controls.username.touched;
```

The errors can be displayed in a react app as follows

```javascript
<div>{usernameTouched && usernameErrors.map((error, i) => <div key={i}>{error}</div>)}</div>
```

> the _touched_ check should be done, otherwise errors would show up without the user interacting with the form unless if this is desired.

#### Validating a form
To validate input values in a form, bind a reference to the form to the Formidate form group using the `group.bind` method. The method takes two arguments
**form** - a reference to the, this can be gotten in difference ways
```javascript
// In React, with a ref assigned to the form
const ref = React.createRef();
const form = ref.current;

// In Vanilla JS, with the DOM element
const form = document.forms[0];
```
**allowedEvents** _(optional)_ - an array with the list of form events that triggers validation, only `input`, `focus` and `blur` are allowed. The default value is `['input']`

```javascript
group.bind(form);
```

A check can also be added on submit of the form, in case the user tends to bypass validation. 
Conventionally, all errors should show up after submitting the form, this can be done by calling the `validator.touchAll()` function in the onsubmit handler. This forces all controls to be touched.

```javascript
onSubmit  = (event) => {
  event.preventDefault();
  if (!validator.valid()) {
    validator.touchAll();
    return;
  }
  // ...
}
```

### Custom and Variable controls

You may need to include custom contraints later on in your code, luckily, Formidator provides a means to accomplish this, you can always add controls using the `validator.addControls` function and remove existing ones with `validator.removeControls` at appropriate places in your code

validator.addControls takes in **controls** as an argument which is an object mapping controls names and the control `(gender: Formidate.control}`
validator.removeControl takes in a variable list of **controlNames**

```javascript
validator.addControls({
  'new-control': Formidate.control(Formidate.rules().required(), 'default-value')
});
// ...
validator.removeControls('existing-control', 'another-control');
```

### Rendering Validation Errors
To display validation errors on your view, call the `validator.render(callback)` function. The callback is a function which takes `valid` and `controls` as arguments and its body should be the logic to render errors to the screen, Call to `validator.render` can be done immediately after creating the validator instance.
```javascript
// the valid argument indicates if the form is valid or not, and controls is a collection of all form controls
validator.render((valid, controls) => {
  // perform logic to display errors to the users here.
  // in a react app this can be as easy as setting the state to trigger a rerender.
  // for a regular html form, certain elements can be updated to contain the validation error in controls
  this.setState({});
});
```

### Formidate example in react component

```jsx harmony
import React from "react";
import Formidate from "formidate";

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.form = React.createRef();

    const controls = {
      username: Formidate.control(
        Formidate.rules()
          .required()
          .customAsync((value, values, controlName) => {
            return (resolve) => {
              if ((value || "").trim() === "") return resolve();

              setTimeout(() => {
                if (["joshua", "john", "rita"].includes(value)) {
                  resolve("%{value} is taken");
                } else {
                  resolve();
                }
              }, 1000);
            };
          })
      ),
      password: Formidate.control(
        Formidate.rules()
          .required()
          .minLength(8)
      ),
      // custom validation can work on controls not associate with an input field on the condition that it is the only rule specified
      unique: Formidate.control(
        Formidate.rules().custom((value, values, controlName) => {
          if (values.username === values.password) {
            return "^the username and password cannot be thesame";
          }
          return null;
        })
      ),
    };

    this.group = Formidate.group(controls);
    this.group.render((valid, controls) => {
      // rerender validation errors and perform actions after validation
      this.setState({});
    });
  }

  componentDidMount(){
    this.group.bind(this.form.current);
  }

  render() {
    // destructure out the controls property
    const { controls } = this.group;

    return (
      <div>
        <form
          ref={this.form}
          onSubmit={this.onSubmit}
          autoComplete="off"
        >
          <label style={{ display: "block" }}>Username</label>
          <input type="text" name="username" />
          {/* display loader if username control is loading or all username errors if field is touched */}
          {controls.username.loading ? (
            <div>checking...</div>
          ) : (
            <div>
              {controls.username.touched &&
                controls.username.errors.map((error, i) => (
                  <div key={i}>{error}</div>
                ))}
            </div>
          )}
          <label style={{ display: "block" }}>Password</label>
          <input type="password" name="password" />
          {/* display first password error at all times if any exists */}
          <div>{controls.password.errors[0]}</div>
          <div>{controls.unique.touched && controls.unique.errors[0]}</div>
          {/* disable submit button based on the form valid state */}
          <button disabled={!this.group.valid()}>Submit</button>
        </form>
      </div>
    );
  }

  onSubmit = (event) => {
    event.preventDefault();
    if (!this.group.valid) {
      this.group.touchAll();
      return;
    }
    // ...
  };
}

export default Component;

```
