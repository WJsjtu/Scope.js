module.exports = function (url, x, y, scaleX, scaleY, scale) {
    const rowCount = 5, columnCount = 4;

    const marginX = (scaleX - scale) > 0 ? (scaleX - scale) / 2 : 0;
    const marginY = (scaleY - scale) > 0 ? (scaleY - scale) / 2 : 0;
    const innerMarginX = (scaleX - scale) < 0 ? (scaleX - scale) / 2 : 0;
    const innerMarginY = (scaleY - scale) < 0 ? (scaleY - scale) / 2 : 0;

    return (
        <div
            style={`margin: ${marginY}px ${marginX}px; border: none; width: ${scaleX}px; height: ${scaleY}px; overflow: hidden;`}>
            <img src={url}
                 style={`width: ${scale * columnCount}px; height: ${scale * rowCount}px; margin-left: ${-x * scale + innerMarginX}px;margin-top: ${-y * scale + innerMarginY}px;`}/>
        </div>
    );
};