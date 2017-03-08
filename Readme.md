# NoFlo Assembly Line

Industrial approach to writing NoFlo applications

[![Build Status](https://travis-ci.org/noflo/noflo-assembly.svg?branch=master)](https://travis-ci.org/noflo/noflo-assembly)

## Goals

  - Build your application like a real world production
  - Make development with [NoFlo](https://noflojs.org) more fun by reducing component boilerplate and the complexity of graphs
  - Follow best practices for concurrency, error handling, etc. to avoid common pitfalls
  - ES6-first

## Example

A rather abstract [example](https://github.com/noflo/noflo-assembly/tree/master/example) is embedded into this repository. We use it in [tests](https://github.com/noflo/noflo-assembly/tree/master/spec), but it also gives an idea what Assembly Line components and graphs look like.

So, this is how you build a car with NoFlo:

![BuildCar.fbp](https://github.com/noflo/noflo-assembly/wiki/images/BuildCar.fbp.png)

The `BuildBody` and `BuildChassis` are actually subgraphs consisting of other components. You can copy and paste `.fbp` code into [NoFlo Visualize](https://noflojs.org/visualize/) to get the picture of those subgraphs.

## Documentation

For introduction, underlying conventions and best practices please see **[NoFlo Assemblipedia](https://github.com/noflo/noflo-assembly/wiki)**.

Below is a quick start guide and technical reference for the NPM package.

## Installation

The package can be installed via NPM:

```
npm install --save noflo-assembly
```

## Component interface

To use features provided by the library, your components should derive from `noflo-assembly.Component` rather than `noflo.Component`. All `noflo.Component` features are also inherited.

Importing the `Component` class in ES6 way:

```javascript
import Component from 'noflo-assembly';
```

We highly recommend declaring named classes instead of instantiating `Component` directly (like many NoFlo examples do), because it makes correct class names appear in stack traces when an error occurs.

### Simple relay-type components

Components having just one input port called `in` and one output port called `out` are called relay-type components and benefit from conveniences such as optional definition of ports and built-in input validation.

The minimal Assembly Line component then looks like this:

```javascript
class Hello extends Component {
  relay(msg, output) {
    msg.hello = 'Hello world!';
    output.sendDone(msg);
  }
}
```

Note that it only applies if the `in` expects a valid assembly message rather than other data type.

### Component constructor options

More details, including the standard NoFlo Component properties, can be specified by calling the constructor of the parent class:

```javascript
  constructor() {
    super({
      description: 'Does lots of nice things',
      icon: 'science'
      inPorts: ['foo', 'bar'],
      outPorts: ['boo', 'baz'],
      validates: ['subitem.id'], // See Validation section below
    });
  }
```

#### Compact port definition syntax

Normal way to define a ports collection in NoFlo is using verbose syntax:

```javascript
inPorts: {
  foo: {
    datatype: 'object',
    description: 'Something',
  },
  bar: {
    datatype: 'string',
    description: 'Else',
  },
}
```

However, when prototyping it may be useful to default to `datatype: 'all'` and reduce to just listing the port names:

```javascript
inPorts: ['foo', 'bar'],
```

This compact record will be automatically expanded by `Component` constructor.

### Multi-route components

Components with multiple input or output ports should not skip port definition and should provide a complete NoFlo process function taking `input` and `output` as arguments.

```javascript
class MountEngine extends Component {
  constructor() {
    super({
      description: 'Mounts 3rd party engine on chassis',
      inPorts: {
        in: {
          datatype: 'object',
          description: 'Assembly',
        },
        engine: {
          datatype: 'string',
          description: 'Engine name',
          control: true,
        },
      },
      validates: { chassis: 'obj' },
    });
  }
  handle(input, output) {
    if (!input.hasData('in', 'engine')) { return null; }

    const msg = input.getData('in');
    const engine = input.getData('engine');

    // Message validation is explicit if there are multiple inports
    if (!this.validate(msg)) {
      return output.sendDone(msg);
    }

    msg.chassis.engine = engine;

    return output.sendDone(msg);
  }
}
```

This example demonstrates verbose form of port declaration. The `handle` method is a normal NoFlo `process` handler function, the name `handle` is used because `process` is already taken.

For more on input validation and sending errors see below.

## Validation and errors

Relay-type components check and validate assembly messages automatically before calling the `relay` method. However, if a component has multiple inputs or needs to check for errors inside the process function, facilities below may come helpful.

### Throwing errors

Once a component encounters an error, the best thing to do is to include this error in the assembly message and send it to all subscribed outputs right away. The `fail()` helper can be used to include errors in the message:

```javascript
import { fail } from 'noflo-assembly';

// ...
// Got an error somewhere in process
if (err) {
  return output.sendDone(fail(msg, err));
}
```

It is important to stop any further processing at this point and send a failed message to all outputs of the assembly message type. Other ways to use the fail helper:

```javascript
// fail modifies its first argument and returns it as well for convenience
// multiple errors can be added via array
fail(msg, [err1, err2, err3]);
output.sendDone({ out1: msg, out2: msg });
```

### Checking failed state

A quick way to check if the message failed earlier and forward it is

```javascript
import { failed } from 'noflo-assembly';

// ...
const msg = input.getData('msg');
const foo = input.getData('foo');
// Right after process precondition and getting the input
if (failed(msg)) {
  return output.sendDone(msg);
}
```

## Concurrency helpers

TODO
