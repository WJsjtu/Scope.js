const folderIcon = ["plain", "desktop", "sound", "doc", "photo", "media", "default", "music", "search", "video"];

module.exports = function (url, type, scale) {

    let typeIndex = folderIcon.indexOf(type);

    if (typeIndex < 0) {
        typeIndex = 0;
    }

    return (
        <div
            style={`padding: 0; margin: 0; margin-right: 2px; margin-top: 1px;border: none; width: ${scale}px; height: ${scale}px; overflow: hidden;display: inline-block; *zoom: 1; *display: inline; float: left;`}>
            <img src={url}
                 style={`width: ${scale * 10}px; height: ${scale}px; margin-left: -${typeIndex * scale}px;margin-top: 0;`}/>
        </div>
    );
};