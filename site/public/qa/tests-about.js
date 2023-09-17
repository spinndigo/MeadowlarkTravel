suite('About' , function(){
    test('page should contain link to contact' , function(){
        assert($('a[href="/contact"]').length);
    })
});