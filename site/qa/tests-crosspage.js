var Browser = require('zombie');
var assert = require('chai').assert;

var browser;

Browser.localhost('localhost', 3000);

suite('Cross-Page Tests' , function(){
    setup(function(){
        browser = new Browser();
        
    });
    
    test('requesting a group rate from the hood river tour page should populate referrer field' , function(done){
        
        var referrer = '/tours/hood-river';
        browser.visit(referrer, function(){
            console.log(browser.location.pathname);
            console.log( 'after initial visit:', browser.body);
            console.log(browser.errors);
            browser.clickLink('.requestGroupRate', function(){
                assert(browser.field('referrer').value === referrer);
                done();
            });

        });
    });

    test('requesting a group rate from the oregon coast tour page should populate referrer field' , function(done){
        var referrer = 'http://localhost:3000/tours/oregon-coast';
        browser.visit(referrer, function(){
            browser.clickLink('.requestGroupRate', function(){
                assert(browser.field('referrer').value === referrer);
                done();
            });

        })
    });

    test('visiting the request group rate page directly should have empty referrer field' , function(done){
       browser.visit('http://localhost:3000/tours/request-group-rate' , function(){
        assert(browser.field('referrer').value === '');
        done();
       })
    });
});
