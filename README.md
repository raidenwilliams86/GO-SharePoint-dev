# $go Library for SharePoint

**$go is a complete rewite of the $sp library. Since this was a major rewrite I am treating this as a new library.**

$go is a lightweight SharePoint AJAX library that makes REST calls extremely simple. This library was designed to give developers of any skill level an easy to use tool that simply works.  Most GET requests can be completed by simply providing a URL. Each call returns a promise that allows chaining of callbacks. See examples below.

```javascript
$sp.get('<REST ENDPOINT>?<ODATA OPERATORS>')
.done(function(data){
   // Logic goes here
})
.fail(function(e){
  // Fail logic goes here
});

// or using a built-in method you could do this
$sp.getCurrentSite()
.done(function(data){
   // Logic goes here
})
.fail(function(e){
  // Fail logic goes here
});

```

The beauty of this library is in it's simplicity. No more memorizing headers or other metdata, simply provide a url and get data back. Need to save something to a list? Provide $go a url and pass in the properly formatted data object and...done. Try it out!!

# Documentation
See the full documentation [here.](/docs/Getting_Started.md)


# Licenses

#### $go License

Copyright (c) 2016 Marc Santiago Garza
Released under the MIT License.
See license [here](license.md).


#### jQuery License

This project uses parts of the [jQuery](http://jquery.com/download/#about-the-code) library at its core. I only use [jQuery](http://jquery.com/download/#about-the-code) as a dependency, and in no way take credit for any of jQuery's work. 

Copyright jQuery Foundation and other contributors
Released under the MIT license
https://jquery.org/license
