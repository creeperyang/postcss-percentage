var postcss = require('postcss')

var plugin = require('./')

function run(input, output, opts) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            expect(result.css).toEqual(output)
            expect(result.warnings().length).toBe(0)
        })
}

function runWithWarnings(input, output, opts, errMsg) {
    return postcss([ plugin(opts) ]).process(input)
        .then(result => {
            var warnings = result.warnings()
            expect(result.css).toEqual(output)
            expect(warnings.length).toBe(1)
            errMsg && expect(warnings[0].text).toBe(errMsg)
        })
}


test('pass through if no `percentage`', () => {
    return run('a{ }', 'a{ }')
})

test('transform 0 to 0 correctly', () => {
    return run('a{width: percentage(0)}', 'a{width: 0}')
})
test('transform decimals to percentage correctly', () => {
    return run('a{width: percentage(0.11)}', 'a{width: 11%}')
})
test('transform simple expression (plus) to percentage correctly', () => {
    return run('a{width: percentage(0.11 + 0.1)}', 'a{width: 21%}')
})
test('transform simple expression (minus) to percentage correctly', () => {
    return run('a{width: percentage(0.11 - 0.1)}', 'a{width: 1%}')
})
test('transform simple expression (multiply) to percentage correctly', () => {
    return run('a{width: percentage(0.11 * 0.1)}', 'a{width: 1.1%}')
})
test('transform simple expression (divide) to percentage correctly', () => {
    return run('a{width: percentage(0.11 / 0.1)}', 'a{width: 110%}')
})

test('transform complex expression to percentage correctly', () => {
    return run(
        'a{width: percentage((0.11 / 0.1 - 1) * 2 + 0.4)}',
        'a{width: 60%}'
    )
})
test('transform multiple decl correctly', () => {
    return run(`.box{
        width: percentage(1 / 24);
        margin: percentage(- 1 / 24) percentage(0.01 * 5);
    }`, `.box{
        width: 4.166667%;
        margin: -4.166667% 5%;
    }`)
})

test('remove trailing zero correctly', () => {
    return run('a{width: percentage(0.1)}', 'a{width: 10%}')
})
test('remove trailing zero correctly', () => {
    return run('a{width: percentage(0.010000)}', 'a{width: 1%}')
})
test('remove trailing zero correctly', () => {
    return run('a{width: percentage(0.0120000)}', 'a{width: 1.2%}')
})
test('keep trailing zero correctly', () => {
    return run('a{width: percentage(0.0120000)}', 'a{width: 1.200000%}', {
        trimTrailingZero: false
    })
})

test('set precision correctly', () => {
    return run('a{width: percentage(0.012345678)}', 'a{width: 1.234568%}')
})
test('set precision correctly', () => {
    return run('a{width: percentage(0.012345678)}', 'a{width: 1.23%}', {
        precision: 2
    })
})

test('handle floor mode correctly', () => {
    return run('a{width: percentage(0.012345678)}', 'a{width: 1.2346%}', {
        precision: 4
    })
})
test('handle floor mode correctly', () => {
    return run('a{width: percentage(0.012345678)}', 'a{width: 1.2345%}', {
        precision: 4,
        floor: true
    })
})
test('handle floor mode correctly', () => {
    return run('a{width: percentage(-0.012345678)}', 'a{width: -1.2345%}', {
        precision: 4,
        floor: true
    })
})

test('report warnings correctly', () => {
    return runWithWarnings(
        'a{width: percentage(0.1 ** 2)}',
        'a{width: percentage(0.1 ** 2)}',
        {},
        '* is not allowed after *'
    )
})

test('support other operators supported by math-expression-evaluator', () => {
    return run('a{width: percentage(tan(40+5) / 2)}', 'a{width: 50%}')
})
