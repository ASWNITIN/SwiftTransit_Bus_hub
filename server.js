var mysql = require('mysql2');
var express = require('express');
var PDFDocument = require('pdfkit');
var fs = require('fs');


var app = express();
const port = 8081;

var bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
   extended: true
}));

var server = app.listen(port, function () {
   var host = server.address().address;
   var port = server.address().port;

   console.log("Example app listening at http://%s:%s", host, port);

});

app.set('view engine', 'ejs');

app.use('/temp', express.static('temp'))

app.get('/', function (req, res) {
   res.redirect('/default/default');
});

app.get('/book/:routeId/:dateSelected/:seatNo/:Name/:phoneNumber', function (req, res) {

   const routeid = req.params.routeId;
   const dateselected = req.params.dateSelected;
   const seatno = req.params.seatNo;
   const name = req.params.Name;
   const phone = req.params.phoneNumber;

   var bookingdate = new Date();
   bookingdate.setTime(Date.parse(dateselected));

   console.log(bookingdate.getTime());
   console.log(routeid);
   console.log(seatno);
   console.log(name);
   console.log(phone);
   let con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "asw"
   });

   con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql = "insert into booking values ('" + routeid + "','" + name + "','" + dateselected + "'," + seatno + ",'" + phone + "')";
      con.query(sql, function (err, result) {
         if (err) { res.redirect('/' + routeid + '/' + bookingdate.getTime()); }
         console.log("1 record inserted");
         res.redirect('/' + routeid + '/' + bookingdate.getTime());
      });
      con.end();
   });
});

app.get('/cancel/:routeId/:dateSelected/:seatNo', function (req, res) {

   const routeid = req.params.routeId;
   const dateselected = req.params.dateSelected;
   const seatno = req.params.seatNo;

   var bookingdate = new Date();
   bookingdate.setTime(Date.parse(dateselected));

   console.log(bookingdate.getTime());
   console.log(routeid);
   console.log(seatno);

   let con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "asw"
   });

   con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql = "delete from booking where RouteId='" + routeid + "' and date_dept='" + dateselected + "' and seat=" + seatno;
      con.query(sql, function (err, result) {
         if (err) { res.redirect('/' + routeid + '/' + bookingdate.getTime()); }
         console.log("1 record inserted");
         res.redirect('/' + routeid + '/' + bookingdate.getTime());
      });
      con.end();
   });
});


app.get('/print/:routeId/:dateSelected/:seatNo', function (req, res) {

   const routeid = req.params.routeId;
   const dateselected = req.params.dateSelected;
   const seatno = req.params.seatNo;

   var bookingdate = new Date();
   bookingdate.setTime(Date.parse(dateselected));

   console.log(bookingdate.getTime());
   console.log(routeid);
   console.log(seatno);

   let con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "asw"
   });

   con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql1 = "SELECT * FROM busroute where RouteId='" + routeid + "'";
      var routeresult;
      con.query(sql1, function (err, result) {
         if (err) throw err;
         routeresult = result;
         var bookingresult;
         var sql0 = "SELECT * FROM booking where RouteId='" + routeid + "' and date_dept='" + dateselected + "' and seat=" + seatno;
         con.query(sql0, function (err, result) {
            if (err) throw err;
            bookingresult = result;
            console.log(bookingresult);
            console.log(routeresult);
            con.end();


            var filename = (new Date()).getTime() + ".pdf";
            let pdfDoc = new PDFDocument;
            pdfDoc.pipe(fs.createWriteStream('temp/'+ filename));
            pdfDoc.fillColor('blue').fontSize(30).text("TRAVEL TICKET",190,40);
            pdfDoc.fillColor('black').fontSize(25).text("ABC Travel Company",180,80);
            pdfDoc.fillColor('black').fontSize(17).text("From",50,120);
            pdfDoc.fillColor('blue').fontSize(17).text(routeresult[0].From_Dept,50,140);
            pdfDoc.fillColor('black').fontSize(17).text("To",250,120);
            pdfDoc.fillColor('blue').fontSize(17).text(routeresult[0].To_Dest,250,140);
            pdfDoc.fillColor('black').fontSize(17).text("Date",425,120);
            pdfDoc.fillColor('blue').fontSize(17).text(dateselected,425,140);
            pdfDoc.fillColor('black').fontSize(17).text("Passenger Name",50,170);
            pdfDoc.fillColor('blue').fontSize(17).text(bookingresult[0].name,50,190);
            pdfDoc.fillColor('black').fontSize(17).text("Deperature Time",250,170);
            pdfDoc.fillColor('blue').fontSize(17).text(routeresult[0].dept_time,250,190);
            pdfDoc.fillColor('black').fontSize(17).text("Vehicle #",425,170);
            pdfDoc.fillColor('blue').fontSize(17).text(routeresult[0].VehicleNo,425,190);
            pdfDoc.fillColor('black').fontSize(25).text("COST:",300,230);
            pdfDoc.fillColor('blue').fontSize(25).text(routeresult[0].price,400,230);
            pdfDoc.end();

            res.send("<script>window.location.href='http://localhost:8081/temp/"+filename+"';</script>");

         });
      });
   });

});

app.get('/:routeId/:dateSelected', function (req, res) {

   const routeid = req.params.routeId;
   const dateselected = req.params.dateSelected;

   console.log(routeid);
   console.log(dateselected);

   let con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "asw"
   });

   con.connect(function (err) {
      if (err) throw err;
      console.log("Connected!");
      var sql1 = "SELECT * FROM busroute";
      var routeresult;
      con.query(sql1, function (err, result) {
         if (err) throw err;
         console.log(result);
         routeresult = result;
         con.end()
      });
      console.log(routeresult);
      var sql0 = "SELECT * FROM booking";
      con.query(sql0, function (err, result) {
         if (err) throw err;
         console.log(result);
         res.render('booking', { routeid: routeid, dateselected: dateselected, route: routeresult, booking: result });
         con.end()
      });

   });

});


