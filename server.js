var express = require('express'),
    openShift = require('./lib/openshift.js').openShiftObj,
    GoogleMapsAPI = require('googlemaps'),
    app = express(),
    fs = require('fs');

gm = new GoogleMapsAPI({
    
        // ALERT! must give a valid key! get one at console.developers.google.com
        key: 'AIzaSyAj0weod4Db1d-05U7YdAkWZxUsVS2MKwM',
        
        stagger_time: 1000, // for elevationPath
        encode_polylines: false,
        secure: true // dont use https (for now)
    }),

    params = {

        //center: '0,0',
        center: '43,-76.5', // my general location
    
        size: '640x480',
        zoom: 6

    },

    // add marker to markers.json
    addMarker = function (newMarker, done) {

        var markers;

        // read markers.json
        fs.readFile('./markers.json', 'utf8', function (err, data) {

            // if undefined assume empty file
            if (data === undefined) {

                markers = {
                    markers: []
                };

            } else {

                markers = JSON.parse(data);

            }

            markers.markers.push(newMarker);

            fs.writeFile('./markers.json', JSON.stringify(markers), function () {

                console.log('file updated!');
                done();

            })

        });

    },


    // update map.png
    updateMap = function (done) {

        // read markers.json
        fs.readFile('./markers.json', 'utf8', function (err, data) {

            // set params markers to what is in the json file markers.json
            params.markers = JSON.parse(data).markers;

            // update the map
            gm.staticMap(params, function (err, img) {

                var buff = new Buffer(img, 'binary');

                fs.writeFile("./views/img/map.png", buff, function (err) {

                    console.log('image updated with markets.json');
                    done();

                });

            });

        });

    };

// use EJS for rendering
app.set('view engine', 'ejs');
app.use(express.static('views')); // must do this to get external files

// body parser for post requests
app.use(require('body-parser').json({}));
app.use(require('body-parser').urlencoded({
    extended: true,
    limit: '5mb'
}));

app.get('/', function (req, res) {

    // just render root.ejs on a get request
    res.render('root.ejs', {});

});

app.post('/', function (req, res) {

    console.log(req.body);

    // add the new marker
    addMarker(req.body, function () {

        // use update map
        updateMap(function () {

            // render on map update
            res.render('root.ejs', {});

        });

    });


});


app.listen(openShift.port, openShift.ipaddress, function (a, b) {

    console.log('geopost is alive');

});