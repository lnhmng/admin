private string AddFiltersToQuery(
    string baseQuery, UploadedData uploadedData, string moNumber, string serialNumber,
    string modelName, string machineCode, string startDate, string endDate,
    string startTime, string endTime)
{
    string sqlQuery = baseQuery;

    if (uploadedData != null && uploadedData.Values.Count > 0 && !string.IsNullOrEmpty(uploadedData.Field)) {
        string safeValues = string.Join("','", uploadedData.Values.Select(s => s.Trim().Replace("'", "''")));
        sqlQuery += $" AND {uploadedData.Field} IN ('{safeValues}')";
    }

    if (!string.IsNullOrEmpty(moNumber))
        sqlQuery += $" AND MO_NUMBER LIKE '%{moNumber.Replace("'", "''")}%'";

    if (!string.IsNullOrEmpty(serialNumber))
        sqlQuery += $" AND SERIAL_NUMBER LIKE '%{serialNumber.Replace("'", "''")}%'";

    if (!string.IsNullOrEmpty(modelName))
        sqlQuery += $" AND MODEL_NAME LIKE '%{modelName.Replace("'", "''")}%'";

    if (!string.IsNullOrEmpty(machineCode))
        sqlQuery += $" AND MACHINE_CODE LIKE '%{machineCode.Replace("'", "''")}%'";

    string safeStartDate = startDate?.Replace("-", "") ?? "";
    string safeEndDate = endDate?.Replace("-", "") ?? "";

    // ===== DATE =====
    if (!string.IsNullOrEmpty(safeStartDate) && !string.IsNullOrEmpty(safeEndDate))
        sqlQuery += $" AND TEST_DATE BETWEEN '{safeStartDate}' AND '{safeEndDate}'";
    else if (!string.IsNullOrEmpty(safeStartDate))
        sqlQuery += $" AND TEST_DATE >= '{safeStartDate}'";
    else if (!string.IsNullOrEmpty(safeEndDate))
        sqlQuery += $" AND TEST_DATE <= '{safeEndDate}'";

    // ===== TIME =====
    string safeStartTime = "";
    string safeEndTime = "";

    if (!string.IsNullOrEmpty(startTime))
        safeStartTime = startTime.Replace(":", "") + "00";

    if (!string.IsNullOrEmpty(endTime))
        safeEndTime = endTime.Replace(":", "") + "59";

    if (!string.IsNullOrEmpty(safeStartDate) && !string.IsNullOrEmpty(safeEndDate)
        && !string.IsNullOrEmpty(safeStartTime) && !string.IsNullOrEmpty(safeEndTime)) {
        int startTimeNum = int.Parse(safeStartTime);
        int endTimeNum = int.Parse(safeEndTime);

        if (safeStartDate == safeEndDate && startTimeNum <= endTimeNum) {
            // Cùng ngày – BETWEEN
            sqlQuery += $" AND TEST_TIME BETWEEN '{safeStartTime}' AND '{safeEndTime}'";
        }
        else if (safeStartDate != safeEndDate && startTimeNum <= endTimeNum) {
            // Nhiều ngày – giờ bình thường
            sqlQuery += $" AND TEST_TIME BETWEEN '{safeStartTime}' AND '{safeEndTime}'";
        }
        else {
            // 🔥 Qua đêm – OR theo ngày
            sqlQuery += $@"
            AND(
                (TEST_DATE = '{safeStartDate}' AND TEST_TIME >= '{safeStartTime}')
            OR(TEST_DATE = '{safeEndDate}'   AND TEST_TIME <= '{safeEndTime}')
     ) ";
        }
    }
    else if (!string.IsNullOrEmpty(safeStartTime)) {
        sqlQuery += $" AND TEST_TIME >= '{safeStartTime}'";
    }
    else if (!string.IsNullOrEmpty(safeEndTime)) {
        sqlQuery += $" AND TEST_TIME <= '{safeEndTime}'";
    }

    Response.Write("<pre>" + Server.HtmlEncode(sqlQuery) + "</pre>");

    return sqlQuery;
}
