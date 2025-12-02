/**
 * Babel plugin to automatically add allowFontScaling={false} to all Text and TextInput components
 * This is the ONLY reliable solution for React Native 0.76+ (0.81.4)
 * 
 * Based on: https://github.com/facebook/react-native/issues/34846
 * React Native 0.76+ uses React 18+ which deprecated defaultProps, so we need compile-time transformation
 */
module.exports = function ({ types: t }) {
  return {
    name: "disable-font-scaling",
    visitor: {
      JSXOpeningElement(path) {
        const elementName = path.node.name;
        
        // Check if this is a Text or TextInput component
        if (
          t.isJSXIdentifier(elementName) &&
          (elementName.name === 'Text' || elementName.name === 'TextInput')
        ) {
          // Check if allowFontScaling prop already exists
          const hasAllowFontScaling = path.node.attributes.some(
            (attr) =>
              t.isJSXAttribute(attr) &&
              t.isJSXIdentifier(attr.name) &&
              attr.name.name === 'allowFontScaling'
          );

          // Only add if it doesn't already exist
          if (!hasAllowFontScaling) {
            path.node.attributes.push(
              t.jsxAttribute(
                t.jsxIdentifier('allowFontScaling'),
                t.jsxExpressionContainer(t.booleanLiteral(false))
              )
            );
          }
        }
      },
    },
  };
};
