// 1. Basic Classes
class Color {
  constructor({ r, g, b, a = 1 }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static get transparent() { return new Color({ r: 0, g: 0, b: 0, a: 0 }); }

  static fromRGB({ r, g, b }) { return new Color({ r, g, b, a: 1 }); }

  static fromHex(hex) {
    hex = hex.replace('#', '');
    let r, g, b, a = 1;

    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }

    return new Color({ r, g, b, a });
  }
  
  copy() {
    return new Color({
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    });
  }

  equals(color) { return this.r === color.r && this.g === color.g && this.b === color.b && this.a === color.a; }

  toHex() {
    const toHexTok = (value) => value.toString(16).padStart(2, '0');
    return `#${toHexTok(this.r)}${toHexTok(this.g)}${toHexTok(this.b)}${this.a < 1 ? toHexTok(Math.round(this.a * 255)) : ''}`;
  }

  toString() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`; }

  withOpacity(opacity) {
    return new Color({ r: this.r, g: this.g, b: this.b, a: opacity });
  }

  adjust(percent) {
    const amt = Math.round(2.55 * percent);
    return new Color({
      r: Math.min(255, Math.max(0, this.r + amt)),
      g: Math.min(255, Math.max(0, this.g + amt)),
      b: Math.min(255, Math.max(0, this.b + amt)),
      a: this.a
    });
  }
}

class BuildContext {
  constructor(widget) {
    this.widget = widget;
  }

  findParent(type) {
    let parent = this.widget;
    while (parent) {
      if (parent instanceof type) return parent;
      parent = parent.parent;
    }
    return null;
  }
}

class Widget {
  constructor(tag, props = {}) {
    this.element = document.createElement(tag);
    this.setProps({ position: 'relative', ...props });
  }

  setProps(props) {
    this.props = props;
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style') {
        Object.assign(this.element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        this.element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        this.element[key] = value;
      }
    });
  }

  appendChild(child, context = new BuildContext(this)) {
    if (child instanceof Widget) {
      child.parent = this;
      const element = child.build(context);
      
      if (!(element instanceof HTMLElement)) {
        console.warn('appendChild called with non-HTMLElement argument');
        return;
      }
      this.element.appendChild(element);
    } else if (child instanceof HTMLElement) {
      this.element.appendChild(child);
    } else if (typeof child === 'string') {
      this.element.appendChild(document.createTextNode(child));
    }
    return child;
  }

  getThemeAwareStyle(context, style = {}) {
    const theme = Theme.of(context);
    const defaultStyle = {
      color: theme.colorScheme.onBackground.toString(),
      backgroundColor: theme.colorScheme.background.toString(),
      ...theme.textStyle
    };
    return { ...defaultStyle, ...style };
  }

  build(context) {
    throw new Error('Not implemented');
  }

  render(parent) {
    parent.appendChild(this.element);
  }
}

// 2. Utility Classes
class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  toString() {
    return `Size(${this.width}, ${this.height})`;
  }
}

class EdgeInsets {
  constructor({ top = 0, right = 0, bottom = 0, left = 0 } = {}) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }

  static get zero() {
    return new EdgeInsets();
  }

  toString() {
    return `EdgeInsets(${this.top}, ${this.right}, ${this.bottom}, ${this.left})`;
  }
}

class Cookies {
  static get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  static set(name, value) {
    document.cookie = `${name}=${value}; path=/`;
  }

  static remove(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }

  static pop(name) {
    const value = Cookies.get(name);
    Cookies.remove(name);
    return value;
  }
}

class Memory {
  #data;
  static #instance;

  constructor() { this.#data = {}; }

  static get instance() {
    if (!this.#instance) this.#instance = new Memory();
    return this.#instance;
  }

  set(key, value) { this.#data[key] = value; }

  get(key) { return this.#data[key]; }

  has(key) { return key in this.#data; }

  remove(key) { delete this.#data[key]; }

  pop(key) {
    const value = this.#data[key];
    delete this.#data[key];
    return value;
  }
}

// 3. Style Classes
class ColorScheme {
  constructor({
    primary = Color.fromHex('#6750A4'),
    onPrimary = Color.fromHex('#FFFFFF'),
    secondary = Color.fromHex('#625B71'),
    onSecondary = Color.fromHex('#FFFFFF'),
    tertiary = Color.fromHex('#7D5260'),
    onTertiary = Color.fromHex('#FFFFFF'),
    error = Color.fromHex('#B3261E'),
    onError = Color.fromHex('#FFFFFF'),
    surface = Color.fromHex('#FFFBFE'),
    onSurface = Color.fromHex('#1C1B1F')
  } = {}) {
    this.primary = primary;
    this.onPrimary = onPrimary;
    this.secondary = secondary;
    this.onSecondary = onSecondary;
    this.tertiary = tertiary;
    this.onTertiary = onTertiary;
    this.error = error;
    this.onError = onError;
    this.surface = surface;
    this.onSurface = onSurface;
  }
}

class TextStyle {
  constructor({ fontSize = '16px', fontWeight = 'normal', color = 'inherit', ...otherStyles } = {}) {
    return { fontSize, fontWeight, color, ...otherStyles };
  }
}

class BoxDecoration {
  constructor({ padding = '0', margin = '0', borderRadius = '0', boxShadow = 'none', position = 'static', top, right, bottom, left, ...otherStyles } = {}) {
    return { padding, margin, borderRadius, boxShadow, position, top, right, bottom, left, ...otherStyles };
  }
}

// 4. Basic Widgets
class Text extends Widget {
  constructor(content, { style = new TextStyle(), ...props } = {}) {
    super('span', { style, ...props });
    this.content = content;
  }

  build(context) {
    this.element.innerHTML = '';
    const theme = Theme.of(context);
    if (theme) this.setProps({ style: { ...theme.textStyle, ...this.props.style ?? {} } });
    this.element.textContent = this.content;
    return this.element;
  }
}

class Center extends Widget {
  constructor(child) {
    super('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    });
    this.child = child;
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);
    return this.element;
  }
}

class Positioned extends Widget {
  constructor({ top = 0, right = 0, bottom = 0, left = 0, layer = 0, child }) {
    super('div', { style: { position: 'relative', zIndex: layer, top, right, bottom, left } });
    this.child = child;
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);
    return this.element;
  }
}

class Container extends Widget {
  constructor({ style = {}, ...props } = {}, children = []) {
    super('div', props);
    this.props = { style, ...props };
    this.children = children;
  }

  build(context) {
    const theme = Theme.of(context);
    const mergedStyle = theme ? { ...theme.boxDecoration, color: theme.colorScheme.onPrimary, ...this.props.style } : this.props.style;

    this.setProps({ ...this.props, style: mergedStyle });
    this.element.innerHTML = '';
    
    this.children.forEach(child => this.appendChild(child));
    return this.element;
  }
}

class GestureDetector extends Widget {
  constructor({ onTap = null, onLongPress = null, ...props } = {}, child = null) {
    super('div', { ...props });
    this.child = child;
    this.onTap = onTap;
    this.onLongPress = onLongPress;
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);

    if (this.onTap) this.element.addEventListener('click', this.onTap);

    if (this.onLongPress) {
      let timer;
      this.element.addEventListener('mousedown', () => {
        timer = setTimeout(() => this.onLongPress(this.element), 500);
      });
      this.element.addEventListener('mouseup', () => clearTimeout(timer));
      this.element.addEventListener('mouseleave', () => clearTimeout(timer));
    }
  }
}

class InkWell extends GestureDetector {
  #listeners = [];

  constructor(child, {
    style = new BoxDecoration(),
    onHover = null,
    onLeave = null,
    onActive = null
  } = {}) {
    super({ style }, child);
    this.baseStyle = style;
    this.onHover = onHover;
    this.onLeave = onLeave;
    this.onActive = onActive;
  }

  build(context) {
    this.element.innerHTML = '';
    this.#listeners.forEach(([event, handler]) => {
      this.element.removeEventListener(event, handler);
    });
    this.#listeners = [];

    const theme = Theme.of(context);
    
    const backgroundColor = Color.fromHex(this.props.style.backgroundColor) || theme.colorScheme.primary;
    
    Object.assign(this.element.style, {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      ...this.baseStyle
    });

    const addListener = (event, handler) => {
      this.element.addEventListener(event, handler);
      this.#listeners.push([event, handler]);
    };

    addListener('mouseenter', () => {
      const darkerColor = backgroundColor.adjust(-10);
      this.element.style.backgroundColor = darkerColor.toString();
      this.onHover?.();
    });

    addListener('mouseleave', () => {
      this.element.style.backgroundColor = backgroundColor.toString();
      this.onLeave?.();
    });

    addListener('mousedown', () => {
      const darkerColor = backgroundColor.adjust(-20);
      this.element.style.backgroundColor = darkerColor.toString();
    });

    addListener('mouseup', () => {
      const darkerColor = backgroundColor.adjust(-10);
      this.element.style.backgroundColor = darkerColor.toString();
      this.onActive?.();
    });

    addListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onActive?.();
      }
    });

    this.appendChild(this.child);
    this.element.setAttribute('tabindex', '0');

    return this.element;
  }
}

class Button extends Widget {
  #listeners = [];

  constructor(label, {
    style = new BoxDecoration({
      padding: '12px 24px',
      whiteSpace: 'nowrap',
      borderRadius: '12px',
      transition: 'all 0.2s ease-in-out'
    }),
    onClick = () => {},
    ...props
  } = {}) {
    super('button', { style, ...props });
    this.label = label;
    this.onClick = onClick;
  }

  build(context) {
    this.#listeners.forEach(([event, handler]) => {
      this.element.removeEventListener(event, handler);
    });
    this.#listeners = [];

    const theme = Theme.of(context);
    const backgroundColor = theme.colorScheme.primary;
    
    Object.assign(this.element.style, {
      ...this.props.style,
      backgroundColor: backgroundColor.toString(),
      color: theme.colorScheme.onPrimary.toString(),
      cursor: 'pointer',
      border: 'none'
    });

    this.element.textContent = this.label;

    const addListener = (event, handler) => {
      this.element.addEventListener(event, handler);
      this.#listeners.push([event, handler]);
    };
    
    addListener('click', this.onClick);
    
    addListener('mouseenter', () => {
      const darkerColor = backgroundColor.adjust(-10);
      this.element.style.backgroundColor = darkerColor.toString();
    });
    
    addListener('mouseleave', () => {
      this.element.style.backgroundColor = backgroundColor.toString();
    });
    
    addListener('mousedown', () => {
      const darkerColor = backgroundColor.adjust(-20);
      this.element.style.backgroundColor = darkerColor.toString();
    });
    
    addListener('mouseup', () => {
      const darkerColor = backgroundColor.adjust(-10);
      this.element.style.backgroundColor = darkerColor.toString();
    });
    
    return this.element;
  }
}

class TextField extends Widget {
  #hasFocus = false;
  #listeners = [];

  constructor({
    placeholder = '',
    value = '',
    style = {},
    onChange = () => {},
    onSubmit = () => {},
    focusColor,
    focusBackgroundColor,
    focusShadowColor,
  } = {}) {
    super('input', {
      type: 'text',
      placeholder,
      value,
      style: {
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        fontSize: '16px',
        width: '100%',
        outline: 'none',
        transition: 'all 0.2s ease-in-out',
        ...style
      }
    });
    
    this.onChange = onChange;
    this.onSubmit = onSubmit;
    this.focusColor = focusColor;
    this.focusBackgroundColor = focusBackgroundColor;
    this.focusShadowColor = focusShadowColor;
  }

  _updateFocusStyles(focused) {
    const theme = Theme.of(this.context);
    if (focused) {
      this.element.style.borderColor = this.focusColor || theme?.colorScheme.primary.toString();
      this.element.style.backgroundColor = this.focusBackgroundColor || theme?.colorScheme.surface.toString();
      this.element.style.boxShadow = `0 2px 4px ${this.focusShadowColor || `${this.focusColor}1a`}`;
    } else {
      this.element.style.borderColor = '#e2e8f0';
      this.element.style.backgroundColor = '#f8fafc';
      this.element.style.boxShadow = 'none';
    }
  }

  build(context) {
    this.context = context;
    const theme = Theme.of(context);
    this.focusColor = this.focusColor || theme.colorScheme.primary.toString();
    this.focusShadowColor = this.focusShadowColor || `${this.focusColor}1a`;

    this.#listeners.forEach(([event, handler]) => {
      this.element.removeEventListener(event, handler);
    });
    this.#listeners = [];

    this.element.style.backgroundColor = theme.colorScheme.surface.toString();
    this.element.style.color = theme.colorScheme.onSurface.toString();

    const addListener = (event, handler) => {
      this.element.addEventListener(event, handler);
      this.#listeners.push([event, handler]);
    };

    addListener('focus', () => {
      this.#hasFocus = true;
      this._updateFocusStyles(true);
    });

    addListener('blur', () => {
      this.#hasFocus = false;
      this._updateFocusStyles(false);
    });

    addListener('input', (e) => this.onChange(e.target.value));

    addListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.onSubmit(e.target.value);
      }
    });

    if (this.#hasFocus) {
      this.element.focus();
      this.#hasFocus = true;
      this._updateFocusStyles(true);
    } else {
      this._updateFocusStyles(false);
    }

    return this.element;
  }

  focus() {
    requestIdleCallback(() => {
      this.element.focus();
      this.#hasFocus = true;
      this._updateFocusStyles(true);
    });
  }

  blur() {
    requestIdleCallback(() => {
      this.element.blur();
      this.#hasFocus = false;
      this._updateFocusStyles(false);
    });
  }

  get value() {
    return this.element.value;
  }

  set value(value) {
    if (this.element) this.element.value = value;
  }
}

// 5. State Management
class InheritedWidget extends Widget {
  constructor({ child, ...props } = {}) {
    super('div', props);
    this.child = child;
    this.dependents = new Set();
    this._cachedContext = null;
  }

  addDependent(dependent) {
    this.dependents.add(dependent);
  }

  get context() {
    if (this._cachedContext === null) throw new Error('Context is not available before build');
    return this._cachedContext;
  }

  static of(context) {
    const widget = context.findParent(this);
    if (widget === null) throw new Error(`No ${this.name} found in context`);
    widget.dependents.add(context.widget);
    return widget;
  }

  notifyDependents() {
    try {
      const context = this.context;
      this.dependents.forEach(dependent => {
        if (dependent.setState) {
          dependent.setState();
        } else {
          const result = dependent.build(context);
          if (result && dependent.element) dependent.element.replaceWith(result);
        }
      });
    } catch (e) {
      console.warn('Cannot notify dependents:', e.message);
    }
  }

  updateShouldNotify(oldWidget) { return true; }

  build(context) {
    const oldContext = this._cachedContext;
    this._cachedContext = context;
    
    if (oldContext && this.updateShouldNotify(oldContext.widget)) this.notifyDependents();
    
    const result = this.child.build(context);
    if (!result) console.warn('Child build returned null or undefined');
    return result;
  }

  dispose() {
    this._cachedContext = null;
    this.dependents.clear();
    super.dispose?.();
  }
}

class StatefulWidget extends Widget {
  #dirty;

  constructor(props = {}) {
    super('div', props);
    this.state = this.createState();
    this.state.widget = this;
    this.state.initState();
  }

  set dirty(value) {
    this.#dirty = value;
    if (value) {
      this.element.innerHTML = '';
      const child = this.state.build(new BuildContext(this));
      if (child) this.appendChild(child);
      this.#dirty = false;
    };
  }

  createState() {
    throw new Error('createState is not implemented');
  }

  build(context) {
    this.element.innerHTML = '';
    const child = this.state.build(new BuildContext(this));
    if (child) this.appendChild(child);
    return this.element;
  }
}

class State extends Widget {
  #mounted;

  constructor(props = {}) {
    super('div', props);
    this.#mounted = false;
  }

  initState() {
    this.#mounted = true;
  }

  get mounted() {
    return this.#mounted;
  }

  setState(callback) {
    if (!this.#mounted) {
      console.warn('Cannot setState before build');
      return;
    }
    callback();
    this.widget.dirty = true;
  }

  build(context) {
    throw new Error('build is not implemented');
  }
}

// 6. Layout Widgets
class Row extends Container {
  constructor({
    mainAlignment = 'flex-start',
    crossAlignment = 'center',
    gap = '0',
    style = {},
    ...props
  } = {}, children = []) {
    super({
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: mainAlignment,
        alignItems: crossAlignment,
        gap,
        ...style
      },
      ...props
    }, children);
  }
}

class Column extends Container {
  constructor({
    mainAlignment = 'flex-start',
    crossAlignment = 'stretch',
    gap = '0',
    style = {},
    ...props
  } = {}, children = []) {
    super({
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: mainAlignment,
        alignItems: crossAlignment,
        gap,
        ...style
      },
      ...props
    }, children);
  }
}

class Card extends Container {
  constructor({
    style = new BoxDecoration({
      padding: '16px',
      margin: '8px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }),
    ...props
  } = {}, children = []) {
    super({ style, ...props }, children);
  }

  build(context) {
    const theme = Theme.of(context);
    const baseStyle = {
      ...this.props.style,
      backgroundColor: theme.colorScheme.surface.toString(),
      color: theme.colorScheme.onSurface.toString()
    };

    this.setProps({ ...this.props, style: baseStyle });
    this.element.innerHTML = '';
    
    this.children.forEach(child => this.appendChild(child));
    return this.element;
  }
}

class AppBar extends Container {
  constructor({
    title,
    titleStyle = new TextStyle({ fontSize: '20px', fontWeight: 'bold' }),
    leading,
    trailing,
    style = new BoxDecoration({
      padding: '16px 24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    })
  } = {}) {
    super({ style });
    this.title = title;
    this.titleStyle = titleStyle;
    this.leading = leading;
    this.trailing = trailing;
  }

  build(context) {
    const theme = Theme.of(context);
    const baseStyle = {
      ...this.props.style,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colorScheme.primary.toString()
    };

    const titleText = new Text(this.title, { 
      style: {
        color: theme.colorScheme.onPrimary.toString(),
        ...this.titleStyle
      }
    });
    

    const children = [];
    if (this.leading) children.push(this.leading);
    children.push(titleText);
    if (this.trailing) children.push(this.trailing);

    this.element.innerHTML = '';
    this.setProps({ style: baseStyle });
    children.forEach(child => this.appendChild(child));
    
    return this.element;
  }
}

class Chip extends Container {
  #listeners = [];

  constructor({
    label,
    labelStyle = new TextStyle({ fontSize: '14px', fontWeight: '600' }),
    style = new BoxDecoration({
      padding: '8px 16px',
      borderRadius: '24px'
    }),
    leading,
    trailing,
    onClick
  } = {}) {
    super({ style });
    this.label = label;
    this.labelStyle = labelStyle;
    this.leading = leading;
    this.trailing = trailing;
    this.onClick = onClick;
  }

  build(context) {
    const theme = Theme.of(context);
    const backgroundColor = Color.fromHex(this.props.style.backgroundColor) || theme.colorScheme.tertiary.withOpacity(0.1);
    const textColor = theme.colorScheme.onTertiary;

    this.#listeners.forEach(([event, handler]) => {
      this.element.removeEventListener(event, handler);
    });
    this.#listeners = [];

    const labelWidget = typeof this.label === 'string'
      ? new Text(this.label, {
          style: {
            color: textColor.toString(),
            ...this.labelStyle
          }
        })
      : this.label;

    const children = [];
    if (this.leading) children.push(this.leading);
    children.push(labelWidget);
    if (this.trailing) children.push(this.trailing);

    if (this.onClick) {
      this.element.style.cursor = 'pointer';
      this.element.setAttribute('tabindex', '0');
      this.element.style.transition = 'all 0.2s ease-in-out';
      
      const addListener = (event, handler) => {
        this.element.addEventListener(event, handler);
        this.#listeners.push([event, handler]);
      };

      addListener('mouseenter', () => {
        this.element.style.backgroundColor = backgroundColor.adjust(-5);
      });

      addListener('mouseleave', () => {
        this.element.style.backgroundColor = backgroundColor;
      });

      addListener('mouseout', () => {
        this.element.style.backgroundColor = backgroundColor;
      });

      addListener('mousedown', () => {
        this.element.style.backgroundColor = backgroundColor.adjust(-10);
      });

      addListener('mouseup', (event) => {
        this.element.style.backgroundColor = backgroundColor.adjust(-5);
        this.onClick(event);
      });

      addListener('keydown', (event) => {
        if (event.key === 'Enter') {
          this.onClick(event);
        }
      });
    }

    this.setProps({
      style: {
        padding: '8px 16px',
        borderRadius: '24px',
        backgroundColor: backgroundColor.toString(),
        ...this.props.style
      }
    });

    this.element.innerHTML = '';
    children.forEach(child => this.appendChild(child));
    
    return this.element;
  }
}

class Scaffold extends Container {
  constructor({ style = {}, appBar, body, bottomBar, ...props } = {}) {
    super({ style: { position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh', ...style }, ...props });
    super.setProps(this.props);
    this.children = [appBar, body, bottomBar];
  }

  build(context) {
    this.element.innerHTML = '';
    this.children.forEach(child => this.appendChild(child));
    return this.element;
  }
}

// 7. Complex Widgets
class MediaQueryData {
  constructor({
    size = new Size(window.innerWidth, window.innerHeight),
    devicePixelRatio = window.devicePixelRatio,
    padding = EdgeInsets.zero,
    viewPadding = EdgeInsets.zero,
    viewInsets = EdgeInsets.zero
  } = {}) {
    this.size = size;
    this.devicePixelRatio = devicePixelRatio;
    this.padding = padding;
    this.viewPadding = viewPadding;
    this.viewInsets = viewInsets;
  }

  toString() {
    return `MediaQueryData(
      size: ${this.size},
      devicePixelRatio: ${this.devicePixelRatio},
      padding: ${this.padding},
      viewPadding: ${this.viewPadding},
      viewInsets: ${this.viewInsets}
    )`;
  }
}

class MediaQuery extends InheritedWidget {
  constructor({ data, child }) {
    super({ child, style: { width: '100%', height: '100%' } });
    this.data = data;
  }

  static of(context) {
    const widget = super.of(context);
    return widget.data;
  }

  updateShouldNotify(oldWidget) {
    return this.data !== oldWidget.data;
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);
    return this.element;
  }
}

class Route {
  constructor({
    builder,
    animation = {
      duration: 300,
      curve: 'ease',
      enter: 'translateX(100%)',
      exit: 'translateX(-100%)'
    }
  }) {
    this.builder = builder;
    this.animation = animation;
  }

  build(context) {
    return this.builder(context);
  }
}

class Navigator extends InheritedWidget {
  #stack;
  #currentRoute;

  constructor({ child } = {}) {
    super({ child });
    this.#stack = [];
    this.#currentRoute = null;
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;
  }

  static push(context, route) {
    const navigator = Navigator.of(context);
    if (!navigator) throw new Error('No Navigator found in context');
    navigator._push(route);
  }

  static pop(context) {
    const navigator = Navigator.of(context);
    if (!navigator) throw new Error('No Navigator found in context');
    navigator._pop();
  }

  static pushReplacement(context, route) {
    const navigator = Navigator.of(context);
    if (!navigator) throw new Error('No Navigator found in context');
    navigator._pushReplacement(route);
  }

  static canPop(context) {
    const navigator = Navigator.of(context);
    if (!navigator) return false;
    return navigator.canPop;
  }

  _animateRoute(newRoute, isForward = true) {
    const { duration, curve, enter, exit } = newRoute.animation;
    const oldElement = this.#currentRoute?.element;
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: ${isForward ? enter : exit};
      transition: transform ${duration}ms ${curve};
    `;
    
    const routeWidget = newRoute.builder(new BuildContext(this));
    routeWidget.parent = this;
    routeWidget.element.innerHTML = '';
    routeWidget.build(new BuildContext(this));
    routeWidget.render(container);
    this.element.appendChild(container);

    requestAnimationFrame(() => {
      container.style.transform = 'translateX(0)';
      if (oldElement) {
        oldElement.style.transform = isForward ? exit : enter;
        oldElement.addEventListener('transitionend', () => {
          oldElement.remove();
        }, { once: true });
      }
    });

    return container;
  }

  canPop() {
    return this.#stack.length > 1;
  }

  _push(route) {
    this.#stack.push(route);
    const element = this._animateRoute(route, true);
    this.#currentRoute = { element, route };
  }

  _pop() {
    if (!this.canPop()) return;
    this.#stack.pop();
    const prevRoute = this.#stack[this.#stack.length - 1];
    const element = this._animateRoute(prevRoute, false);
    this.#currentRoute = { element, route: prevRoute };
  }

  _pushReplacement(route) {
    this.#stack.pop();
    this._push(route);
  }

  build(context) {
    if (!this.#currentRoute && this.child) {
      const initialRoute = new Route({ builder: () => this.child });
      this._push(initialRoute);
    }
    return this.element;
  }
}

// 8. Theme and MaterialApp
class Theme extends InheritedWidget {
  constructor({ colorScheme = new ColorScheme(), textStyle = new TextStyle(), boxDecoration = new BoxDecoration(), ...props } = {}, child = null) {
    super({ child, ...props });
    this.props.style = {
      ...this.props.style,
      width: '100%',
      height: '100%'
    };
    this.colorScheme = colorScheme;
    this.textStyle = textStyle;
    this.boxDecoration = boxDecoration;
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);
    return this.element;
  }
}

class ScaffoldMessengerState extends State {
  #contextArea = null;

  initState() {
    super.initState();
    this.#contextArea = document.createElement('div');
    Object.assign(this.#contextArea.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '9999'
    });
    document.body.appendChild(this.#contextArea);
  }

  dispose() {
    if (this.#contextArea) {
      document.body.removeChild(this.#contextArea);
    }
    super.dispose();
  }

  showSnackBar({ context, snackBar, duration = 4000 }) {
    const element = snackBar.build(context);
    this.#contextArea.appendChild(element);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transform = 'translate(-50%, 0)';
        element.style.opacity = '1';
      });
    });

    setTimeout(() => {
      element.style.transform = 'translate(-50%, 100%)';
      element.style.opacity = '0';
      setTimeout(() => {
        if (element.parentNode === this.#contextArea) {
          this.#contextArea.removeChild(element);
        } else {
          console.warn('SnackBar has already been removed from the ScaffoldMessenger');
        }
      }, 200);
    }, duration);
  }

  showDialog({ context, dialog }) {
    const element = dialog.build(context);
    this.#contextArea.appendChild(element);
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.#contextArea);
    this.widget.child.parent = this.widget;
    const element = this.widget.child.build(new BuildContext(this));
    this.element.appendChild(element);
    this.appendChild(element);
    return this.element;
  }
}

class ScaffoldMessenger extends StatefulWidget {
  constructor({ child, props = {} }) {
    super(props);
    this.child = child;
  }

  createState() {
    return new ScaffoldMessengerState();
  }

  static of(context) {
    const widget = context.findParent(ScaffoldMessenger);
    return widget.state;
  }
}

class SnackBar extends Widget {
  constructor({
    text,
    textStyle = new TextStyle(),
    action
  }) {
    super('div');
    this.text = text;
    this.textStyle = textStyle;
    this.action = action;
  }

  build(context) {
    this.element.innerHTML = '';
    this.element = document.createElement('div');

    const theme = Theme.of(context);

    Object.assign(this.element.style, {
      backgroundColor: theme.colorScheme.surface.toString(),
      color: theme.colorScheme.onSurface.toString(),
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translate(-50%, 100%)',
      padding: '14px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '320px',
      maxWidth: '640px',
      opacity: '0',
      pointerEvents: 'auto',
      transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
      fontSize: '14px'
    });

    const textElement = new Text(this.text, { 
      style: { 
        ...this.textStyle,
        color: theme.colorScheme.onSurface.toString()
      } 
    }).build(context);
    this.element.appendChild(textElement);

    if (this.action) {
      const actionButton = document.createElement('button');
      Object.assign(actionButton.style, {
        marginLeft: '16px',
        padding: '8px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        color: theme.colorScheme.onSurface.toString(),
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        textTransform: 'uppercase',
        transition: 'opacity 0.2s ease-in-out'
      });
      
      actionButton.textContent = this.action.label;
      actionButton.addEventListener('click', this.action.onClick);
      actionButton.addEventListener('mouseenter', () => {
        actionButton.style.opacity = '0.8';
      });
      actionButton.addEventListener('mouseleave', () => {
        actionButton.style.opacity = '1';
      });
      
      this.element.appendChild(actionButton);
    }
    
    return this.element;
  }
}

class Dialog extends Widget {
  constructor({ content, onClose, props = {} }) {
    super('div', { style: props.style });
    this.child = new Container({
      child: content,
      style: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }
    });
    this.onClose = onClose;
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    this.checker = (event) => {
      if (event.target !== this.element) {
        this.element.remove();
        this.onClose();
      }
    }
  }

  build(context) {
    this.element.innerHTML = '';
    this.parent = context.widget;
    this.appendChild(this.child, context);
    document.removeEventListener('click', this.checker);
    document.addEventListener('click', this.checker);
    return this.element;
  }
}

class AlertDialog extends Dialog {
  constructor({ title, content, onClose, props = {} }) {
    super({ content: new Text(content), onClose, props });
    this.child = new Column(
      {
        style: new BoxDecoration({
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        })
      },
      [
        new Text(title, { style: { fontSize: '18px', fontWeight: 'bold' } }),
        new Text(content, { style: { marginTop: '8px' } })
      ]
    );
  }
}

class MaterialApp extends Widget {
  constructor({
    theme = new Theme(),
    home,
    style = new BoxDecoration({
      width: '100vw',
      height: '100vh',
      margin: '0',
      padding: '0',
      overflow: 'hidden'
    })
  } = {}) {
    super('div', { style });
    this.child = new Theme({
      colorScheme: theme.colorScheme,
      textStyle: theme.textStyle,
      boxDecoration: theme.boxDecoration,
      child: new MediaQuery({
        data: new MediaQueryData(),
        child: new ScaffoldMessenger({
          child: new Navigator({
            child: home
          })
        })
      })
    });
  }

  
  set theme(value) {
    const currentTheme = this.child;
    currentTheme.colorScheme = value.colorScheme;
    currentTheme.textStyle = value.textStyle;
    currentTheme.boxDecoration = value.boxDecoration;
    document.body.innerHTML = 'Apply Theme...';
    requestIdleCallback(() => {
      document.body.innerHTML = '';

      this.build(new BuildContext(null));
      document.body.appendChild(this.element);
    });
  }

  build(context) {
    this.element.innerHTML = '';
    this.appendChild(this.child);
    return this.element;
  }
}

// 9. Async Widgets
class Connection {
  static get none() { return new Connection('none'); }
  static get waiting() { return new Connection('waiting'); }
  static get done() { return new Connection('done'); }

  constructor(state) { this.state = state; }

  equals(other) {
    return other instanceof Connection && this.state === other.state;
  }
}

class Snapshot {
  constructor(connection = Connection.none, data = null, error = null) {
    this.connection = connection;
    this.data = data;
    this.error = error;
  }

  static waiting() {
    return new Snapshot(Connection.waiting);
  }

  static withData(data) {
    return new Snapshot(Connection.done, data);
  }

  static withError(error) {
    return new Snapshot(Connection.done, null, error);
  }

  get hasData() {
    return this.data !== null;
  }

  get hasError() {
    return this.error !== null;
  }
}

class PromiseBuilder extends InheritedWidget {
  constructor({ promise, builder }) {
    super({ child: null }, { promise, builder });
    this.builder = builder;
    this.addDependent(this);
    this.promise = promise;
  }

  async updatePromise(promise) {
    try {
      this.value = Snapshot.waiting();
      this.notifyDependents();
      const data = await promise;
      this.value = Snapshot.withData(data);
      this.notifyDependents();
    } catch (error) {
      this.value = Snapshot.withError(error);
      this.notifyDependents();
    }
  }

  build(context) {
    if (!this._cachedContext) {
      this._cachedContext = context;
      this.updatePromise(this.promise);
    }
    this.element.innerHTML = '';
    const childWidget = this.builder(context, this.value);
    if (childWidget) {
      childWidget.parent = this;
      const childContext = new BuildContext(this);
      childWidget.build(childContext);
      this.appendChild(childWidget, childContext);
    }
    return this.element;
  }
}

class Builder extends Widget {
  constructor(buildFunction) {
    super('div');
    this.buildFunction = buildFunction;
  }

  build(context) {
    const widget = this.buildFunction(context);
    widget.parent = this.parent;
    widget.build(context);
    this.element = widget.element;
  }
}

function runApp(app) {
  document.body.innerHTML = 'Loading...';
  if (document.styleSheets.length === 0) {
    const style = document.createElement('style');
    document.head.appendChild(style);
    document.styleSheets[0].insertRule('html, body { margin: 0; padding: 0; width: 100vw; height: 100vh; }');
    document.styleSheets[0].insertRule('body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }');
    document.styleSheets[0].insertRule('::-webkit-scrollbar { width: 16px; height: 16px; }');
    document.styleSheets[0].insertRule('::-webkit-scrollbar-track { background-color: #f4f4f4; border-radius: 16px; }');
    document.styleSheets[0].insertRule('::-webkit-scrollbar-thumb { background-color: #babac0; border-radius: 16px; border: 4px solid #f4f4f4; }');
    document.styleSheets[0].insertRule('::-webkit-scrollbar-thumb { min-height: 80px; }');
  }
  requestIdleCallback(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = 'hidden';
    const root = app instanceof MaterialApp ? app : new MaterialApp({ child: app });
    root.build(new BuildContext(null));
    document.body.appendChild(root.element);
  });
}

export { BoxDecoration, BuildContext, Builder, Button, Color, Cookies, Card, Chip, Column, Connection, Center, Container, ColorScheme, Memory, EdgeInsets, GestureDetector, InheritedWidget, InkWell, MaterialApp, MediaQuery, MediaQueryData, Navigator, PromiseBuilder, Route, Row, Scaffold, Size, Snapshot, StatefulWidget, State, Text, TextField, TextStyle, Theme, Positioned, Widget, AppBar, ScaffoldMessenger, SnackBar, Dialog, AlertDialog, runApp };