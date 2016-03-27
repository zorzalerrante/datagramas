

if (_columns == null) {
      _columns = d3.keys(_data_dataframe[0]);
}

var chart = parsets()
      .dimensions(_columns)
      .height(_vis_height)
      .width(_vis_width);

container.datum(_data_dataframe).call(chart);
