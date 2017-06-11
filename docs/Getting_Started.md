# $go Docs

1. [Instantiation]()
2. [Options]()
3. [Built-in Methods]()
4. [Extend $go]()
5. [Method Reference]()

# Instantiation

$go instantiates itself on script load so instead of calling `$go()` you simply call `$go.method()`. This was a design choice more than anything. I wanted to keep things inline with how you call `$.ajax()`. Below are some defaults of the $go object.

**By default:**

1. All results are returned in JSON
2. The Base Url is set to: `_spPageContextInfo.webAbsoluteUrl`

# Options

$go allows you to override some of these default options by providing an object literal to the `$go.opts()` method. Currently $go only has one option and that is 'returnType', but the options object can also be used to store options for plugins or custom functions.

**Important!** When using `$go.opts()` you are asking $go to take your options object and return a new instance using those options. To use this object more than once you must store a reference to that object in a variable.  

**Correct Usage**
```javascript
// Create options object
var options = {
  returnType: 'XML' //instead of JSON, why you would do this idk
};

// Pass in options object and store in variable
var spxml = $go.opts(options);

// Now when you want XML results simply call
spxml.method();

```

**Incorrect Usage**
```javascript
// Create options object
var options = {
  returnType: 'XML' //instead of JSON
};

// Pass in options object
$go.opts(options);

// This is calling the default $go object without your options
$go.get();

```

### A quick note on url's

url's are handled in two ways by $go. The logic is very simple. Let's use a simple GET request as an example. If you are trying to retrieve data from the current site you can simply pass in the endpoint url. (Ex. "/_api/web/lists/") However if you need to retrieve data from another location use the full url. (Ex. "http://site.com/_api/web/lists/"). Easy stuff. I do have jsonp support built into this library as well but keep in mind configuration may be needed on your end to make that work.

# $go.get()

The $go.get method is well...a method to go get stuff from SharePoint. There are a couple of ways you are allowed to use the get() method. Parameters can either be passed in individually, or as an object literal.

**Accepted Params:**

- url 
- header - (optional) if another header type is needed you can pass it in or just extend the one currently being used 
- jsonp - (optional) Bool that will use JSONP

```javascript
// Pass params in individually
$go.get(url)
.done(function(data){
  // Logic goes here
});

// or pass in as object literal
$go.get({
  url: 'url',
  header: 'header'
})
.done(function(data){
  // Logic goes here
});
```

# $go.post()

The $go.post() method is used to push data back up to SharePoint. With a POST, parameters are passed as an object literal. For most operations the data field is required however because of the flexability of the library I have listed it as optional. 

**Accepted Params:**

- url 
- data - (optional) Data Object must be in correct format
- header - (optional) if another header type is needed you can pass it in or just extend the one currently being used 
- jsonp - (optional) Bool that will use JSONP

```javascript
$go.post({
  url: 'url',
  header: 'header',
  data: 'data'
})
.done(function(data){
  // Logic goes here
});
```

# $go.merge() and $go.put()

The $go.merge() method is used to update items within SharePoint. Merge allows you to only update the fields that have changed in that item. A PUT will overwrite the entire list item, so use with caution. With MERGE and PUT, parameters are passed as an object literal. In the demo, an asterisk to the ifMatch. This was for illustration only, if an eTag has not been passed an asterisk is implied. 

**Accepted Params:**

- url 
- data -  Data Object must be in correct format
- header - (optional) if another header type is needed you can pass it in or just extend the one currently being used 
- ifMatch - (optional) If no eTag is passed in, $go defaults to "*"
- jsonp - (optional) Bool that will use JSONP

```javascript
// MERGE
$go.merge({
  url: 'url',
  header: 'header',
  data: 'data',
  ifMatch: '*' 
})
.done(function(data){
  // Logic goes here
});

// PUT
$go.put({
  url: 'url',
  header: 'header',
  data: 'data',
  ifMatch: '*' 
})
.done(function(data){
  // Logic goes here
});
```

# $go.remove()

The $go.remove() method is basically the delete method. If you need to remove items from SharePoint this is your method. With Remove, parameters are passed as an object literal. This method is basically an empty slate. I have the header set for delete and i basically stepped out of the way and allowed for customizations on every property. I didnt want to try and predict every instance of it's use. 

**Accepted Params:**

- url 
- data - (optional) Data Object must be in correct format
- header - (optional) if another header type is needed you can pass it in or just extend the one currently being used 
- ifMatch - (optional) If no eTag is passed in, $go defaults to "*"
- jsonp - (optional) Bool that will use JSONP

```javascript
$go.remove({
  url: 'url',
  header: 'header',
  data: 'data',
  ifMatch: '*' 
})
.done(function(data){
  // Logic goes here
});
```


# Extending $go

$go was built to be extended. Trying to add every available method or endpoint into the library would not only be time consuming but would bloat the file size. Everyone's needs are different so this is meant to be a foundation to build on. There are two methods available that allow you to extend it. The first method is `$go.registerPlugin()` and the second is `$go.addHeaderTemplate()`.

## $go.registerPlugin()

```javascript
// Build Plugin as Object Literal
var plugin = {
  name: 'social',
  plugin: {
      methodOne: function(){
        // Logic Here
      },
      methodTwo: function(){
        // Logic Here
      }
  }
};

// Register Plugin
$go.registerPlugin(plugin);

// Use Plugin
$go.social.methodOne();
```

## $go.addHeaderTemplate()
The second way to extend $go is by expanding the Header Templates. There may be a header you use often or just one that is special enough to be added. To do this use the `$go.addHeaderTemplate()` method. DO NOT alter the built-in header templates. This could break other built-in methods. Instead create a new template and extend the library.

```javascript
// Build Plugin as Object Literal
var header = {
  name: 'custom',
  header: {
    'X-RequestDigest': $('#__REQUESTDIGEST').val(),
    'accept': 'application/json; odata=verbose',
    'content-type': 'application/json; odata=verbose',
    'specialValue': 'value'
  }
};

// Register Header Template
$go.addHeaderTemplate(header);

// Use Custom Header
$go.post({
  url: 'url',
  header: $go.customHeaders.custom,
  data: 'data'
});

$go.customHeaders.specialGET;
```

# Built-In Method Reference
One day I will provide more information than function signatures, most of these are self explanatory so this isn't high up on the todo list.

## List Functions
- getListItem(listName, itemId)
- getListItems(listName)
- createList(params) {}, (params: allowContentTypes, baseTemplate, contentTypesEnabled, description, title)
- addListColumns(params) {}, (params: columns, listName)
- addContentTypetoList(listName, contentTypeID)

## Site Functions
- getCurrentSite()
- createSite(params) {}, (params: url, title, description, language, webTemplate, uniquePermissions)
- getSubSites()
- getParentSite()

## User Functions
- getCurrentUser()
- getInfoForUser(userId)
- createGroup(groupName)
- addToGroup(groupId, loginName)
- removeFromGroup(groupId, loginName)
- getUsersForRole(role)
- addRole(obj)
- removeRole(role, loginName)

## Helper Functions
- getBaseUrl()
- isValidJson(jsonObject)
- getRequestDigest()
- sortByKey(key, desc)
- xmlToJson(xmlObject)