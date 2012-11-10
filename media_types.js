var util = require('util');

var notExports = {};

exports.create = function(data) {
  var media = null;

  if (typeof data.type != 'undefined') {
    switch (data.type) {
      case 'image':
        media = new notExports.Image(data.x, data.y, data.rotation, data.src, data.width, data.height);
        break;
      case 'youtube':
        media = new notExports.YouTube(data.x, data.y, data.rotation, data.id, data.width, data.height);
        break;
      case 'path':
        media = new notExports.Path(data.x, data.y, data.rotation, data.relativePoints, data.thickness, data.color);
        break;
      default:
        console.warn('Unrecognized media type %s', data.type);
    }
  }

  if (media != null && !media.error) {
    return media;
  } else {
    return null;
  }
}

notExports.Media = function(type, x, y, rotation) {
  this.type = type;
  this.error = false;
  this.x = x;
  this.y = y;
  this.rotation = rotation;

  if (!this._isString(this.type)) this.error = true;
  if (!this._isInt(this.x)) this.error = true;
  if (!this._isInt(this.y)) this.error = true;
  if (!this._isInt(this.rotation)) this.error = true;
}
notExports.Media.prototype = {
  toJson: function() {
    var json = {};
    for (x in this) {
      if (typeof this[x] != 'function' && x != 'error') {
        json[x] = this[x];
      }
    }

    return json;
  },

  _isInt: function(number) {
    if (typeof number == 'number') return true; // so obvious...
    
    if (typeof number != 'string'
      || number.match(/^[0-9]+$/) == null)
    {
      console.warn('%s is not an int', number);
      return false;
    }

    return true;
  },

  _isNonNegativeInt: function(number) {
    if (!this._isInt(number)) return false;
    
    if (parseInt(number) < 0) {
      console.warn('%s is not a non negative int', number);
      return false;
    } else {
      return true;
    }
  },

  _isString: function(string) {
    if (typeof string != 'string'
      || string.length == 0) {
      console.warn('%s is not a valid string', string);
      return false;
    } else {
      return true;
    }
  },

  _isHexColor: function(color) {
    if (typeof color != 'string'
      || (color.length != 4 && color.length != 7)
      || color[0] != '#') {
      console.warn('%s is not a hex color', color);
      return false;
    }

    for (var i = color.length - 1; i > 0; i--) {
      if (color[i].match(/[0-9a-f]/i) == null) {
        console.warn('%s is not a hex color', color);
        return false;
      }
    };

    return true;
  }
};

notExports.Image = function(x, y, rotation, src, width, height) {
  notExports.Media.call(this, 'image', x, y, rotation);

  this.src = String(src).trim();
  this.width = width;
  this.height = height;

  if (!this._isString(this.src)) this.error = true;
  if (!this._isNonNegativeInt(this.width)) this.error = true;
  if (!this._isNonNegativeInt(this.height)) this.error = true;
}
util.inherits(notExports.Image, notExports.Media);

notExports.YouTube = function(x, y, rotation, id, width, height) {
  notExports.Media.call(this, 'youtube', x, y, rotation);

  this.id = String(id).trim();
  this.width = width;
  this.height = height;

  if (!this._isString(this.id)) this.error = true;
  if (!this._isNonNegativeInt(this.width)) this.error = true;
  if (!this._isNonNegativeInt(this.height)) this.error = true;
}
util.inherits(notExports.YouTube, notExports.Media);

notExports.Path = function(x, y, rotation, relativePoints, thickness, color) {
  notExports.Media.call(this, 'path', x, y, rotation);

  this.relativePoints = relativePoints;
  this.thickness = thickness;
  this.color = String(color).trim();

  if (typeof this.relativePoints == 'string') {
    // try to convert a JSON-encoded string back to object
    try {
      this.relativePoints = JSON.parse(this.relativePoints);
    } catch (SyntaxError) {
      console.warn('Failed to parse JSON-encoded string: %s', this.relativePoints);
    }
  }
  if (typeof this.relativePoints != 'object') this.error = true;
  else {
    // further check for relative points
    for (i in this.relativePoints) {
      if (!this._isInt(this.relativePoints[i].x)
        || !this._isInt(this.relativePoints[i].y)) {
        console.warn('Below is not a valid relative point');
        console.warn(this.relativePoints[i]);
        this.error = true;
        break;
      }
    }
  }

  if (!this._isNonNegativeInt(this.thickness)) this.error = true;
  if (!this._isHexColor(this.color)) this.error = truee;
}
util.inherits(notExports.Path, notExports.Media);