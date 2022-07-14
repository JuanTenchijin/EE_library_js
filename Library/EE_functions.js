///// Data

exports.CONSTANTS = {
  MODIS_LST: 'MODIS/061/MOD11A1',
  RAINFALL : "UCSB-CHG/CHIRPS/DAILY",
  SENTINEL2: "COPERNICUS/S2_SR"
}

/*
*  Functions to export
*
*/


/*
*  Function to identify suitable areas to develop crops based on Land Surface Temperature and Rainfall conditionals
*  First conditional = 10 - 25 degrees
* Second conditional = 5 mm - 20 mm
* Let's find which are the areas within a region that meet both conditional more days
*/

exports.RainfallAndSurfaceTemperature = function (start, end, region, minRain, maxRain, minTemp, maxTemp){
  
  var rainfall = ee.ImageCollection(exports.CONSTANTS.RAINFALL).filterDate(start, end).filterBounds(region)
  
  var surface_temperature = ee.ImageCollection(exports.CONSTANTS.MODIS_LST).filterDate(start, end).filterBounds(region).select("LST_Day_1km")
  
  var rainfall_conditional = conditional_rainfall(rainfall,minRain, maxRain)
  
  var LST_modis_celsius = surface_temperature.map(ConvertKelvinToCelsius)
  
  var LST_modis_celsius_conditional = conditional_temperature(LST_modis_celsius,minTemp, maxTemp)
  
    ///Combine two image collections
  var col_rainfall = rainfall_conditional
  var col_lst = LST_modis_celsius_conditional.select('temperature')
  
  var filter = ee.Filter.equals({
    leftField: 'system:time_start',
    rightField: 'system:time_start'
  });
  
  // Create the join.
  var simpleJoin = ee.Join.inner();
  
  // Inner join
  var innerJoin = ee.ImageCollection(simpleJoin.apply(col_rainfall, col_lst, filter))
  
  var joined_collection = innerJoin.map(function(feature) {
    return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  })
  
  var output_4000m = joined_collection.map(reduceBands).sum().reproject("EPSG:4326", null, 4000)
  
  var output_1000m = joined_collection.map(reduceBands).sum().reproject("EPSG:4326", null, 1000).focal_mode(2)
  
  
  return output_1000m.rename("numbDays")
  
  //Map.addLayer(output_4000m.clip(region), {min:0, max:10, palette:["red", "orange", "yellow", "green", "blue"]}, "Output 4000m")
  //Map.addLayer(output_1000m.clip(region), {min:0, max:10, palette:["red", "orange", "yellow", "green", "blue"]}, "Output 1000m")
  //Map.addLayer(trial_two.first().clip(region), {min:0, max:1}, "TRIAL")
}

exports.NDVI = function (start, end, region){
  
  var col = ee.ImageCollection(exports.CONSTANTS.SENTINEL2).filterDate(start, end).filterBounds(region)
  .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 10)
  .map(maskS2clouds)
  .select("B8", "B4")
  
  var mean = col.mosaic().normalizedDifference(["B8", "B4"]).rename("NDVI")
  
  return mean
}

/*
*    HELPER FUNCTIONS
*
*/
/*
function conditional_rainfall (img){
  
  var image = ee.Image(0).rename("rainfall")
  .where(img.gte(5).and(img.lte(20)), 1)
  .where(img.lt(5).and(img.gte(20)), 0)
  
  return image.set("system:time_start", img.get("system:time_start"))
}
*/

function conditional_rainfall (image, min, max){
  
  var image = image
  
  var final = image.map(function( image ){
    
  var new_image = ee.Image(0).rename("rainfall")
  .where(image.gte(min).and(image.lte(max)), 1)
  .where(image.lt(min).and(image.gte(max)), 0)
  
  return new_image.set("system:time_start", image.get("system:time_start"))
    
  })

  return final.set("system:time_start", image.get("system:time_start"))

}

/*

function conditional_temperature (img){
  
  var image = ee.Image(0).rename("temperature")
  .where(img.gte(10).and(img.lte(25)), 1)
  .where(img.lt(10).and(img.gte(25)), 0)
  
  return image.set("system:time_start", img.get("system:time_start"))
}
*/

function conditional_temperature (image, min, max){
  
  var image = image
  
  var final = image.map(function( image ){
    
  var new_image = ee.Image(0).rename("temperature")
  .where(image.gte(min).and(image.lte(max)), 1)
  .where(image.lt(min).and(image.gte(max)), 0)
  
  return new_image.set("system:time_start", image.get("system:time_start"))
    
  })

  return final.set("system:time_start", image.get("system:time_start"))

}


/*
*  Function transforming Kelvins to Celsius
*/

function ConvertKelvinToCelsius (thisImage){
  var lst_factor = 0.02;
  var offset = -273.15;
thisImage = thisImage.multiply(lst_factor)
                      .add(offset)
                      .copyProperties(thisImage,['system:time_start']);
 return thisImage;
}


function reduceBands (img){
  
  var reducer = img.reduce(ee.Reducer.mean()).eq(1)
  
  return reducer.set("systme:time_start", img.get("system:time_start"))
  
}

/*
* CLOUD MASK S2
*/

function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}
