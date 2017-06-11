(function (global, ctx, $) {
  'use strict';

  // Dependency Check
  if (!$ || !ctx) {
    var dep = !$ ? 'jQuery 2.x' : !ctx ? 'SharePoint 2013' : '';
    throw new Error('Missing dependency. ' + dep + ' is required for $go.');
  }

  var defaultOptions = {
    returnType: 'JSON'
  };
  var version = '0.9.0';
  var go;

  /*========================
	HEADER TEMPLATES -
	I store my Header Templates in a private variable to save you from yourself. There is nothing
	special here so You may be tempted to change these base headers. That is a poor life choice.
	If you need to alter a header, use the $go.addHeaderTemplate() method. Touching this will
	break all my Base Modules and put you on a NSA watchlist.
	======================== */
  var headerTemplates = {
    get: {
      'accept': 'application/json; odata=verbose'
    },

    post: {
      'X-RequestDigest': $('#__REQUESTDIGEST').val(),
      'accept': 'application/json; odata=verbose',
      'content-type': 'application/json; odata=verbose'
    },

    merge: {
      "X-HTTP-Method": "MERGE",
      "accept": "application/json;odata=verbose",
      "content-type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*"
    },

    put: {
      "X-HTTP-Method": "PUT",
      "accept": "application/json;odata=verbose",
      "content-type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*"
    },

    remove: {
      "X-HTTP-Method": "DELETE",
      "accept": "application/json;odata=verbose",
      "content-type": "application/json;odata=verbose",
      "X-RequestDigest": $("#__REQUESTDIGEST").val(),
      "IF-MATCH": "*"
    },

    xml: {
      'accept': 'application/atom+xml',
      'content-type': 'application/atom+xml'
    }
  };

  /*========================
	BASE AJAX METHOD WRAPPER -
	This is the base wrapper around jQuery's AJAX method. All built-in data calls will reference this internal method. Updating this will change the behavior of the entire library so you breaky, you buy.
	========================*/
  // options = method, url, headers, data, ifMatch, datatype, jsonp, ctx

  var ajax = function ajax(options) {

    // Option Object modification
    options.url = helperFn.checkUrl(options.url);
    options.header = options.ifMatch !== null ? options.header['IF-MATCH'] = options.ifMatch : options.header;

    // Checks this instance to see if XML has been requested
    if (options.ctx.options && options.ctx.options.returnType === 'XML') {
      options.header.accept = headerTemplates.xml.accept;
      options.header['content-type'] = headerTemplates.xml['content-type'];

    }

    return $.ajax(options);

  };

  /*========================
	HELPER FUNCTIONS -
	This is a built-in module that handles commone calls for helper.
	========================*/
  var helperFn = {

    isValidJson: function isValidJson(json) {
      try {
        global.JSON.parse(json);
        return true;

      } catch (e) {
        return false;

      }
    },

    parseUrl: function parseUrl(url) {
      var regex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g;
      var str = url;
      var obj = {};
      var g;

      while ((g = regex.exec(str)) !== null) {
        if (g.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        g.forEach(function (match, groupIndex) {
          obj[groupIndex] = match;
        });
      }

      return obj;

    },

    checkUrl: function checkUrl(url) {
      var regex = /^\//;
      var _url = this.parseUrl(url);

      if (_url[2] === 'http' || _url[2] === 'https') {
        return url;
      }

      if (_url[5].indexOf('.com') !== -1) {
        return window.location.protocol + "//" + url;
      }

      if (regex.test(url)) {
        return ctx.webAbsoluteUrl + url;

      } else {
        return ctx.webAbsoluteUrl + "/" + url;

      }

    },

    getRequestDigest: function getRequestDigest() {
      return this.get('/_api/contextinfo');
    },

    sortByKey: function sortByKey(key, desc) {
      return function sort(a, b) {
        return desc ? (a[key] < b[key]) : (a[key] > b[key]);
      };
    }

  };

  /*=======================================
	USER FUNCTIONS -
	This is a built-in module that handles commone calls for users.
	=======================================*/
  var userFn = {

    getCurrentUser: function getCurrentUser() {
      return this.get({
        url: '/_api/web/currentuser'
      });
    },

    getInfoForUser: function getInfoForUser(userId) {
      return this.get({
        url: '/_vti_bin/ListData.svc/UserInformationList?$filter=Id%20eq%20' + userId
      });
    },

    createGroup: function createGroup(groupName) {
      return this.post({
        url: '/_api/web/sitegroups/',
        data: '{"__metadata": {"type":"SP.Group"}, "Title":"' + groupName + '" }'
      });
    },

    addToGroup: function addToGroup(groupId, loginName) {
      return this.post({
        url: '/_api/web/sitegroups(' + groupId + ')/users',
        data: '{"__metadata": {"type":"SP.User"}, "LoginName":"' + loginName + '" }'
      });
    },

    removeFromGroup: function removeFromGroup(groupId, userId) {
      return this.post({
        url: '/_api/web/sitegroups(' + groupId + ')/users/removebyid(' + userId + ')'
      });
    },

    getUsersForRole: function (role) {
      var data = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">' +
        '<soap12:Body>' +
        '<GetUserCollectionFromRole xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        ' <roleName>' + role + '</roleName>' +
        '</GetUserCollectionFromRole>' +
        ' </soap12:Body>' +
        '</soap12:Envelope>';

      return this.get({
        url: '/_vti_bin/usergroup.asmx',
        data: data
      });
    },

    addRole: function addUser(params) {
      var data = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<AddUserToRole xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        '<roleName>' + params.role + '</roleName>' +
        '<userName>' + params.username + '</userName>' +
        '<userLoginName>' + params.loginName + '</userLoginName>' +
        '<userEmail>' + params.email + '</userEmail>' +
        '<userNotes>' + params.notes + '</userNotes>' +
        '</AddUserToRole>' +
        '</soap:Body>' +
        '</soap:Envelope>';

      return this.get({
        url: '/_vti_bin/UserGroup.asmx',
        data: data
      });
    },

    removeRole: function removeUser(role, loginName) {
      var data = '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        ' <RemoveUserFromRole xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">' +
        ' <roleName>' + role + '</roleName>' +
        '<userLoginName>' + loginName + '</userLoginName>' +
        '</RemoveUserFromRole>' +
        '</soap:Body>' +
        '</soap:Envelope>';

      return this.get({
        url: '/_vti_bin/UserGroup.asmx',
        data: data
      });
    }

  };

  /*======================================
	SITE FUNCTIONS -
	This is a built-in module that handles commone calls for sites.
	=======================================*/
  var siteFn = {

    getCurrentSite: function getCurrentSite() {
      return this.get({
        url: '/_api/web/'
      });
    },

    createSite: function createSite(params) {
      var data = global.JSON.stringify({
        'parameters': {
          '__metadata': {
            'type': 'SP.WebInfoCreationInformation'
          },
          'Url': params.url,
          'Title': params.title,
          'Description': params.description || '',
          'Language': params.language || 1033,
          'WebTemplate': params.webTemplate || 'sts',
          'UseUniquePermissions': params.uniquePermissions || false
        }
      });

      return this.post({
        url: '/_api/web/webinfos/add',
        data: data
      });
    },

    getSubSites: function getSubSites() {
      return this.get({
        url: '/_api/web/webinfos/'
      });
    },

    getParentSite: function getParentSite() {
      return this.get({
        url: '/_api/web/parentweb'
      });
    }
  };

  /*=======================================
	LIST FUNCTIONS -
	This is a built-in module that handles commone calls for lists.
	=======================================*/
  var listFn = {

    getListItem: function (listName, itemId) {
      return this.get({
        url: "/_api/web/lists/GetByTitle('" + listName + "')/items('" + itemId + "')"
      });
    },

    getListItems: function getListItems(listName) {
      return this.get({
        url: "/_api/web/lists/getByTitle('" + listName + "')/items"
      });
    },

    createList: function createList(params) {
      var intData = {
        '__metadata': {
          'type': 'SP.List'
        },
        'AllowContentTypes': params.allowContentTypes || true,
        'BaseTemplate': params.baseTemplate || 100,
        'ContentTypesEnabled': params.contentTypesEnabled || true,
        'Description': params.description || '',
        'Title': params.title
      };

      return this.post({
        url: '/_api/web/lists/',
        data: global.JSON.stringify(intData)
      });
    },

    addListColumns: function (params) {
      var url = "/_api/web/Lists/getbytitle('" + params.listName + "')/fields";
      var colsList = params.columns;
      var length = colsList.length;
      var data;
      var i;

      for (i = 0; i < length; i += 1) {
        data += "{ '__metadata': { 'type': 'SP.Field' }, 'FieldTypeKind': " + colsList[i].type + ", 'Title':'" + colsList[i].name + "'}";

      }

      return this.post({
        url: url,
        data: data
      });

    },

    addContentTypetoList: function (listName, contentTypeID) {
      this.post({
        url: "/_api/web/lists/getbytitle('" + listName + "')/ContentTypes/AddAvailableContentType",
        data: {
          "contentTypeId": contentTypeID
        }
      });
    }
  };

  /*=======================================
	CONSTRUCTOR FUNCTION - CREATES NEW GO OBJECT
	=======================================*/
  go = function () {
    return new go.fn.init();
  };

  /*=======================================
	GO PROTOTYPE
	=======================================*/
  go.fn = go.prototype = {

    version: version,
    constructor: go,
    customHeaders: {},

    init: function () {
      this.options = defaultOptions;
      return this;
    },

    // Create new GO Object with custom options
    config: function configureOptions(optObj) {
      var obj = new go.fn.init();

      //ADD PASSED IN OPTIONS TO INSTANCE OPTIONS
      $.extend(obj.options, optObj);

      return obj;
    },

    get: function (params) {
      var options = typeof params === 'object' ? params : {
        url: params
      };

      options.method = 'GET';
      options.header = params.header || headerTemplates.get;
      options.data = null;
      options.context = this;
      options.dataType = params.jsonp || false;

      return ajax(options);
    },

    post: function (params) {
      var options = {
        method: 'POST',
        url: params.url,
        data: params.data,
        header: params.header || headerTemplates.post,
        dataType: params.jsonp || false,
        context: this
      };

      return ajax(options);
    },

    merge: function (params) {
      var options = {
        method: 'POST',
        url: params.url,
        data: params.data,
        header: params.header || headerTemplates.merge,
        ifMatch: params.ifMatch,
        dataType: params.jsonp || false,
        context: this
      };

      return ajax(options);
    },

    put: function (params) {
      var options = {
        method: 'POST',
        url: params.url,
        data: params.data,
        header: params.header || headerTemplates.put,
        ifMatch: params.ifMatch,
        dataType: params.jsonp || false,
        context: this
      };

      return ajax(options);
    },

    remove: function (params) {
      var options = {
        method: 'POST',
        url: params.url,
        data: params.data,
        header: params.header || headerTemplates.remove,
        ifMatch: params.ifMatch,
        dataType: params.jsonp || false,
        context: this
      };

      return ajax(options);
    },

    registerPlugin: function registerPlugin(object, flag) {
      var pluginObj = {};
      var msg = "Your plugin has been registered.";

      if (object.name && !flag) {
        pluginObj[object.name] = object.plugin;
        $.extend(go.fn, pluginObj);

        return msg;

      }

      if (flag) {
        $.extend(go.fn, object);
        return msg;
      }

      throw new global.Error("registerPlugin(): Object must have a name attribute.");
    },

    addHeaderTemplate: function addHeaderTemplate(object) {
      var headerObj = {};
      var msg = 'Your header has been added.';

      //If the object has a name property, add plugin to headerObj
      if (object.name && typeof object.header === 'object') {
        headerObj[object.name] = object.header;
        $.extend(go.fn.customHeaders, headerObj);

        return msg;

      } else {
        throw new global.Error("addHeaderTemplate(): Object must have a name attribute.");

      }
    }

  };

  /*=======================================
	BUILD AND MAP TO WINDOW
	=======================================*/
  go.fn.init.prototype = go.fn;

  $.extend(go.prototype, helperFn, userFn, siteFn, listFn);

  global.$go = go();

}(window, _spPageContextInfo, window.jQuery));