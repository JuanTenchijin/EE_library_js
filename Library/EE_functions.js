///// Data

exports.CONSTANTS = {
  MODIS_LST: 'MODIS/061/MOD11A1',
  RAINFALL : "UCSB-CHG/CHIRPS/DAILY",
  SENTINEL2: "COPERNICUS/S2_SR",
  INTERPOLATED_LST_DAY : "projects/sat-io/open-datasets/gap-filled-lst/gf_day_1km",
  INTERPOLATED_LST_NIGHT : "projects/sat-io/open-datasets/gap-filled-lst/gf_night_1km",
  MODE: {palette:["green", "blue", "yellow", "orange", "red"]}
}


//// Collections LST in Degrees Celsius

exports.Collections_LST = {
  
  MODIS_LST_before_2003_day : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2000-01-01", "2002-12-31"),
  
  MODIS_LST_after_2020_day : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2021-01-01", "2024-12-31"),
  
  MODIS_LST_before_2003_night : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2000-01-01", "2002-12-31"),
  
  MODIS_LST_after_2020_night : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2021-01-01", "2024-12-31"),
  
  MODIS_LST_2002_2003_2021_today_day : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2000-01-01", "2002-12-31")
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2021-01-01", "2024-12-31")),
  
  MODIS_LST_2002_2003_2021_today_night : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2000-01-01", "2002-12-31")
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2021-01-01", "2024-12-31")),
  
  MODIS_LST : ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km"),
  
  MODIS_LST_interpolated_day : ee.ImageCollection(exports.CONSTANTS.INTERPOLATED_LST_DAY).map(ConvertKelvinToCelsius_interpolated).map(rename_day),
  
  MODIS_LST_interpolated_night : ee.ImageCollection(exports.CONSTANTS.INTERPOLATED_LST_NIGHT).map(ConvertKelvinToCelsius_interpolated).map(rename_night),
  
  MODIS_all_day : ee.ImageCollection(exports.CONSTANTS.INTERPOLATED_LST_DAY).map(ConvertKelvinToCelsius_interpolated).map(rename_day)
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2000-01-01", "2002-12-31")
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Day_1km").filterDate("2021-01-01", "2024-12-31"))),

  MODIS_all_night : ee.ImageCollection(exports.CONSTANTS.INTERPOLATED_LST_DAY).map(ConvertKelvinToCelsius_interpolated).map(rename_day)
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2000-01-01", "2002-12-31")
  .merge(ee.ImageCollection(exports.CONSTANTS.MODIS_LST).map(ConvertKelvinToCelsius).select("LST_Night_1km").filterDate("2021-01-01", "2024-12-31")))


  
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

exports.Conditionals = function (dataset){
  
  
  if (dataset == "LST_Day_1km"){
    
    var img = exports.LandSurfaceTemperature_day(start, end, region, minTemp, maxTemp)
    
    var stats = img.reduceRegion({
      reducer:ee.Reducer.minMax(),
      scale:1000,
      geometry: region
    }).evaluate(function(stats){
      
      
    Map.addLayer(img.clip(region), {min: stats.numbDays_min, max: stats.numbDays_max, palette:["blue", "green", "yellow", "orange", "red"]})
      
      
    })
    
    
    
  }
  
  if (dataset == "Rainfall"){
    
    var img = exports.RainfallCriteria(start, end, region, minRain, maxRain)
    
    var stats = img.reduceRegion({
      reducer:ee.Reducer.minMax(),
      scale:1000,
      geometry: region
    }).evaluate(function(stats){
      
      
    Map.addLayer(img.clip(region), {min: stats.numbDays_min, max: stats.numbDays_max, palette:["blue", "green", "yellow", "orange", "red"]})
      
      
    })
    
  }
  
  if (dataset == "LST_Night_1km"){
    
    var img = exports.LandSurfaceTemperature_night(start, end, region, minTemp, maxTemp)
    
    var stats = img.reduceRegion({
      reducer:ee.Reducer.minMax(),
      scale:1000,
      geometry: region
    }).evaluate(function(stats){
      
      
    Map.addLayer(img.clip(region), {min: stats.numbDays_min, max: stats.numbDays_max, palette:["blue", "green", "yellow", "orange", "red"]})
      
      
    })
    
  }
  
  if (dataset == "LST_day_Rainfall"){
    
    var img = exports.RainfallAndSurfaceTemperature_day(start, end, region, minRain, maxRain, minTemp, maxTemp)
    
    var stats = img.reduceRegion({
      reducer:ee.Reducer.minMax(),
      scale:1000,
      geometry: region
    }).evaluate(function(stats){
      
      
    Map.addLayer(img.clip(region), {min: stats.numbDays_min, max: stats.numbDays_max, palette:["blue", "green", "yellow", "orange", "red"]})
      
      
    })
    
  }
  
  if (dataset == "LST_night_Rainfall"){
    
    var img = exports.RainfallAndSurfaceTemperature_night(start, end, region, minRain, maxRain, minTemp, maxTemp)
    
    var stats = img.reduceRegion({
      reducer:ee.Reducer.minMax(),
      scale:1000,
      geometry: region
    }).evaluate(function(stats){
      
      
    Map.addLayer(img.clip(region), {min: stats.numbDays_min, max: stats.numbDays_max, palette:["blue", "green", "yellow", "orange", "red"]})
      
      
    })
    
  }
  
}

exports.RainfallAndSurfaceTemperature_day = function (start, end, region, minRain, maxRain, minTemp, maxTemp){
  
  var rainfall = ee.ImageCollection(exports.CONSTANTS.RAINFALL).filterDate(start, end).filterBounds(region)
  
  var rainfall_conditional = conditional_rainfall(rainfall,minRain, maxRain)
  
  var collection = ee.ImageCollection(exports.Collections_LST.MODIS_all_day).filterDate(start, end).filterBounds(region)
  
  var LST_modis_celsius = collection
  
  var LST_modis_celsius_conditional = conditional_temperature(LST_modis_celsius,minTemp, maxTemp)
  
  var list = ee.List.sequence(0, rainfall_conditional.size().subtract(1))
  
      ///Combine two image collections
  var col_rainfall = rainfall_conditional.sort("system:time_start")
  var col_lst = LST_modis_celsius_conditional.sort("system:time_start")
  
  function AddIndex_lst( idx ){
  var im = col_rainfall.toList(col_rainfall.size()).get(ee.Number(idx));
  im = ee.Image(im).set("ID", list.get(idx));
  return im;
}

  function AddIndex_rainfall( idx ){
  var im = col_lst.toList(col_lst.size()).get(ee.Number(idx));
  im = ee.Image(im).set("ID", list.get(idx));
  return im;
}
  
  var lst_nums_rainfall = ee.List.sequence(0, col_rainfall.size().subtract(1));
  var list = ee.List(list);
  var lst_ims = lst_nums_rainfall.map(AddIndex_rainfall);
  
  col_rainfall = ee.ImageCollection(lst_ims);
  
  var lst_nums_lst = ee.List.sequence(0, col_lst.size().subtract(1));
  var list = ee.List(list);
  var lst_ims = lst_nums_lst.map(AddIndex_lst);
  
  col_lst = ee.ImageCollection(lst_ims);
  
  var filter = ee.Filter.equals({
    leftField: 'ID',
    rightField: 'ID'
  });
  
  // Create the join.
  var simpleJoin = ee.Join.inner();
  
  // Inner join
  var innerJoin = ee.ImageCollection(simpleJoin.apply(col_rainfall, col_lst, filter))
  
  var joined_collection = innerJoin.map(function(feature) {
    return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  })
  
  var output_1000m = joined_collection.map(reduceBands).sum().reproject("EPSG:4326", null, 1000).focal_mode(1.5)
  
  
  return output_1000m.rename("numbDays")
  
}

exports.RainfallAndSurfaceTemperature_night = function (start, end, region, minRain, maxRain, minTemp, maxTemp){
  
  var rainfall = ee.ImageCollection(exports.CONSTANTS.RAINFALL).filterDate(start, end).filterBounds(region)
  
  var rainfall_conditional = conditional_rainfall(rainfall,minRain, maxRain)
  
  var collection = ee.ImageCollection(exports.Collections_LST.MODIS_all_night).filterDate(start, end).filterBounds(region)
  
  var LST_modis_celsius = collection
  
  var LST_modis_celsius_conditional = conditional_temperature(LST_modis_celsius,minTemp, maxTemp)
  
  var list = ee.List.sequence(0, rainfall_conditional.size().subtract(1))
  
      ///Combine two image collections
  var col_rainfall = rainfall_conditional.sort("system:time_start")
  var col_lst = LST_modis_celsius_conditional.sort("system:time_start")
  
  function AddIndex_lst( idx ){
  var im = col_rainfall.toList(col_rainfall.size()).get(ee.Number(idx));
  im = ee.Image(im).set("ID", list.get(idx));
  return im;
}

  function AddIndex_rainfall( idx ){
  var im = col_lst.toList(col_lst.size()).get(ee.Number(idx));
  im = ee.Image(im).set("ID", list.get(idx));
  return im;
}
  
  var lst_nums_rainfall = ee.List.sequence(0, col_rainfall.size().subtract(1));
  var list = ee.List(list);
  var lst_ims = lst_nums_rainfall.map(AddIndex_rainfall);
  
  col_rainfall = ee.ImageCollection(lst_ims);
  
  var lst_nums_lst = ee.List.sequence(0, col_lst.size().subtract(1));
  var list = ee.List(list);
  var lst_ims = lst_nums_lst.map(AddIndex_lst);
  
  col_lst = ee.ImageCollection(lst_ims);
  
  var filter = ee.Filter.equals({
    leftField: 'ID',
    rightField: 'ID'
  });
  
  // Create the join.
  var simpleJoin = ee.Join.inner();
  
  // Inner join
  var innerJoin = ee.ImageCollection(simpleJoin.apply(col_rainfall, col_lst, filter))
  
  var joined_collection = innerJoin.map(function(feature) {
    return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
  })
  
  var output_1000m = joined_collection.map(reduceBands).sum().reproject("EPSG:4326", null, 1000).focal_mode(1.5)
  
  
  return output_1000m.rename("numbDays")
  
}

exports.RainfallCriteria = function (start, end, region, minRain, maxRain){
  
  var rainfall = ee.ImageCollection(exports.CONSTANTS.RAINFALL).filterDate(start, end).filterBounds(region)
  
  var rainfall_conditional = conditional_rainfall(rainfall,minRain, maxRain)
  
  var output_4000m = rainfall_conditional.map(reduceBands).sum().reproject("EPSG:4326", null, 4000)

  return output_4000m.rename("numbDays")
  
}

exports.LandSurfaceTemperature_day = function (start, end, region, minTemp, maxTemp){
  
  var LST_modis_celsius = ee.ImageCollection(exports.Collections_LST.MODIS_all_day).filterDate(start, end).filterBounds(region)
  
  var LST_modis_celsius_conditional = conditional_temperature(LST_modis_celsius,minTemp, maxTemp)
  
  var output_1000m = LST_modis_celsius_conditional.map(reduceBands).sum().reproject("EPSG:4326", null, 1000)  //.focal_mode(2)
  
  return ee.Image(output_1000m).rename("numbDays")
  
  } 

exports.LandSurfaceTemperature_night = function (start, end, region, minTemp, maxTemp){
  
  var LST_modis_celsius = ee.ImageCollection(exports.Collections_LST.MODIS_all_night).filterDate(start, end).filterBounds(region)
  
  var LST_modis_celsius_conditional = conditional_temperature(LST_modis_celsius,minTemp, maxTemp)
  
  var output_1000m = LST_modis_celsius_conditional.map(reduceBands).sum().reproject("EPSG:4326", null, 1000)  //.focal_mode(2)
  
  return ee.Image(output_1000m).rename("numbDays")
  
  } 
  

/*
*    HELPER FUNCTIONS
*
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
 return thisImage;
}

function ConvertKelvinToCelsius_interpolated (thisImage){
  var lst_factor = 0.1;

   thisImage = thisImage.multiply(lst_factor)
                      .copyProperties(thisImage,['system:time_start']);
 return thisImage;
}

/*
* Reduce Bands
*
*/

function reduceBands (img){
  
  var reducer = img.reduce(ee.Reducer.mean()).eq(1)
  
  return reducer.set("systme:time_start", img.get("system:time_start"))
  
}

/*
*
* Function to interpolate temporally
*/


function LinearResampling(collection, date_attribute, date_interval, region) {
    // Setup timestep
    var bandNames = collection.first().bandNames();
    var minDate = ee.Date(ee.Number(collection.first().get(date_attribute)));
    collection = collection.map(function (image) {
        return (
            image
            .set("timestep", ee.Number(ee.Date(ee.Number(
                image.get(date_attribute)
            )).difference(minDate, "day")).float())
        );
    }).sort("timestep");

    // Calculate date limit for resampling range
    var dateLimit = ee.Number(
        ee.Image(collection.toList(1, collection.size().add(-1)).get(0)).get("timestep")
    ).ceil().int();
    
    // Calculate date indexes for time interval
    var indexes = collection.map(function (image) {
        var constant = (
            ee.Image.constant(
                ee.Number(image.get("timestep")).float()
            ).float().mask(
                ee.Image(image).mask().float().select([0])
            ).set(
                "timestep", image.get("timestep")
            ).rename("timestep")
        );
        return image.addBands(constant);
    }).sort("timestep", false);

    var dateSequence = ee.List.sequence(0, dateLimit.add(-1), date_interval);
    var mosaicUpperVal = ee.List(dateSequence.iterate(function (dateVal, acc) {
      var idx = ee.Number(dateVal).float().divide(date_interval).round().int();
      acc = ee.List(acc);
      var latest_image = (indexes
            .filter(
                ee.Filter.gte('timestep', ee.Number(dateVal).float())
            ).mosaic()
        );
      return acc.add(latest_image)
    }, ee.List([])))
    var dateDiff = (dateSequence.slice(1, dateSequence.size()).map(function (dateVal) {
    var idx = ee.Number(dateVal).float().divide(date_interval).round().int();
        return (
            ee.Image(mosaicUpperVal.get(idx))
            .subtract(ee.Image(mosaicUpperVal.get(idx.subtract(1))))
        ).neq(0);
    }));
    dateDiff = ee.List([dateDiff.get(0)]).cat(dateDiff);
    var mosaicLowerVal = ee.List(ee.List((
        dateSequence
        .iterate(function (dateVal, acc) {
            var idx = ee.Number(dateVal).float().divide(date_interval).round().int();
            acc = ee.List(acc);
            var min_img = ee.Image(acc.get(0));
            var list = ee.List(acc.get(1));
            var diff = ee.Image(dateDiff.get(idx));
            var new_img = ee.Image(mosaicUpperVal.get(idx.subtract(1)));
            // min_img = min_img.where(diff.and(new_img.mask()), new_img);
            min_img = min_img.where(diff, new_img);
            list = list.add(min_img);
            return [min_img, list];
        }, ee.List([ee.Image(mosaicUpperVal.get(0)), []]))
    )).get(1));
    var interpolated = ee.List(dateSequence.iterate(function (dateVal, acc) {
        acc = ee.List(acc);
        var idx = ee.Number(dateVal).float().divide(date_interval).round().int();
        var minFrame = ee.Image(mosaicLowerVal.get(idx)).float();
        var maxFrame = ee.Image(mosaicUpperVal.get(idx)).float();
        
        var minDate = minFrame.select("timestep");
        var maxDate = maxFrame.select("timestep");
        var minVal = minFrame.select(bandNames);
        var maxVal = maxFrame.select(bandNames);
        var constantIdx = (
            ee.Image.constant(ee.Number(dateVal)).float()
            .clip(region).rename("timestep")
        );
        
        var out = minVal.add(
            (maxVal.subtract(minVal))
            .multiply(constantIdx.subtract(minDate))
            .divide(maxDate.subtract(minDate))
        );
        // Replace masked value with previous interpolated image (a.k.a replicate padding)
        out = ee.Algorithms.If(
          acc.size().gt(0),
          out.unmask(0).clip(
            region
          ).where(
            out.mask().not(),
            acc.get(acc.size().add(-1))
          ),
          out
        );
        return acc.add(out);
    }, ee.List([])));
    return ee.ImageCollection(interpolated);
}

/*
*
*
*/

function rename_day (img){
  return img.rename("LST_Day_1km").set("system:time_start", img.get("system:time_start"))
}

function rename_night(img){
  return img.rename("LST_Night_1km").set("system:time_start", img.get("system:time_start"))
}
