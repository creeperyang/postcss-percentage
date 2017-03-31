var postcss = require('postcss')
var parser = require('postcss-value-parser')
var evaluator = require('math-expression-evaluator')

function transformPercentage(value, precision, floor, trimTrailingZero) {
    return parser(value).walk(function (node) {
        if (node.type !== 'function' || node.value !== 'percentage') {
            return
        }

        var result = evaluator.eval(parser.stringify(node.nodes)) * 100
        // Special handle 0
        if (result === 0) {
            node.value = '0'
            node.type = 'word'
            return
        }
        if (floor) {
            result = result.toString()
            var index = result.indexOf('.')
            node.value = index === -1 ?
                result : result.substring(0, index + 1 + precision)
        } else {
            node.value = result.toFixed(precision)
        }
        if (trimTrailingZero) {
            node.value = node.value
                .replace(/\.0+$/, '')
                .replace(/(\.\d*[1-9])0+$/, '$1')
        }
        node.value += '%'
        node.type = 'word'
    }).toString()
}

module.exports = postcss.plugin(
    'postcss-percentage',
    function percentagePlugin(opts) {
        var options = opts || {}
        // Default set precision to 6 decimals: 4.1666666666666% --> 4.166667%
        if (
            options.precision == null ||
            options.precision > 20 ||
            options.precision < 0
        ) {
            options.precision = 6
        }
        // Default trim trailing zeroes: 4.000000% --> 4%
        if (options.trimTrailingZero == null) {
            options.trimTrailingZero = true
        }

        return function transform(root, result) {
            root.walkDecls(function (decl) {
                if (!decl.value || !/percentage\s*\(/.test(decl.value)) {
                    return
                }

                try {
                    decl.value = transformPercentage(
                        decl.value,
                        options.precision,
                        options.floor,
                        options.trimTrailingZero
                    )
                } catch (e) {
                    decl.warn(result, e.message, {
                        word: decl.value,
                        index: decl.index
                    })
                }
            })
        }
    }
)
