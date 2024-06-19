"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    drift?: any;
  }
}

type StyleObject = {
  [key: string]: string;
};

function createStyleString(style?: StyleObject) {
  if (!style) return "";
  return Object.keys(style).reduce((styleString, styleName) => {
    const styleValue = style[styleName];

    styleName = styleName.replace(
      /[A-Z]/g,
      (match) => `-${match.toLowerCase()}`
    );

    return `${styleString}${styleName}: ${styleValue} !important;`;
  }, "");
}

function insertScript(scriptText: string) {
  const script = document.createElement("script");
  script.innerText = scriptText;
  script.async = true;
  document.body.appendChild(script);
}

// @NOTE: With credit to https://github.com/chardmd/react-drift
class DriftScript {
  static initialize(props: DriftProps) {
    this.addMainScript(props);
    this.addAttributes(props);
    this.addEventHandlers(props);
    this.addCustomStyle(props);
  }

  static addMainScript(props: DriftProps) {
    const scriptText = `!function() {
            var t = window.driftt = window.drift = window.driftt || [];
            if (!t.init) {
              if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
              t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on", "setUserAttributes" ],
              t.factory = function(e) {
                return function() {
                  var n = Array.prototype.slice.call(arguments);
                  return n.unshift(e), t.push(n), t;
                };
              }, t.methods.forEach(function(e) {
                t[e] = t.factory(e);
              }), t.load = function(t) {
                var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
                o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
                var i = document.getElementsByTagName("script")[0];
                i.parentNode.insertBefore(o, i);
              };
            }
          }();
          drift.SNIPPET_VERSION = '0.3.1';
          drift.load('${props.appId}');`;

    (insertScript as any)(scriptText);
  }

  static addAttributes(props: DriftProps) {
    let scriptText = "";
    if (typeof props.userId !== "undefined") {
      scriptText = `
            var t = window.driftt = window.drift = window.driftt || [];
            drift.identify('${props.userId}', ${JSON.stringify(
        props.attributes
      )})
          `;
      insertScript(scriptText);
    } else if (props.attributes) {
      scriptText = `
            drift.on('ready', function() {
              drift.api.setUserAttributes(${JSON.stringify(props.attributes)})
            })
          `;
      insertScript(scriptText);
    }
  }

  static addEventHandlers(props: DriftProps) {
    if (props.eventHandlers && Array.isArray(props.eventHandlers)) {
      props.eventHandlers.forEach((handler) => {
        let scriptText = `
            drift.on('${handler.event}', ${handler.function});
            `;
        insertScript(scriptText);
      });
    }
  }

  static addCustomStyle(props: DriftProps) {
    if (props.style) {
      const style = document.createElement("style");
      document.head.appendChild(style);
      style.innerText = `
            iframe#drift-widget {
              ${createStyleString(props.style)}
            }
          `;
    }
  }
}

type DriftProps = {
  appId: string;
  userId?: string;
  attributes?: object;
  eventHandlers?: Array<{ event: string; function: Function }>;
  style?: StyleObject;
};

export default function Drift(props: DriftProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.drift) {
      DriftScript.initialize(props);
      console.log("Drift Initialized");
    }
  });

  return null;
}
