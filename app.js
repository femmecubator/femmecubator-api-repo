let express = require( "express" ),
    app = express();

app.listen( 3000, () => {
    console.log( "Server running on port 3000" );
} );

app.get( "/:name", ( req, res ) => {
    const name = req.params.name;

    res.json( `Hello ${name}` );
} );
