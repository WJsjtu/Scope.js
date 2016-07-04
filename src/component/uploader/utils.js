const imageRegex = /\.(bmp|jpe?g|tiff|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|png)$/i;
const videoRegex = /\.(mp4|mkv|rmvb|rm|flv|avi|mpe?g|3gp|wmv|f4v|mov|swf|vob)$/i;
const soundRegex = /\.(mp3|wav|ape|aac|wma)$/i;

module.exports = {
    isFunction: (function () {
        return "object" === typeof document.getElementById ? function (fn) {
            try {
                return /^\s*\bfunction\b/.test("" + fn);
            } catch (x) {
                return false
            }
        } : function (fn) {
            return "[object Function]" === Object.prototype.toString.call(fn);
        };
    })(),
    uid: function () {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        return s.join("");
    },
    date: function (date, _fmt) {
        if (!date || isNaN(+date)) {
            return '';
        }
        _fmt = _fmt || "yyyy-MM-dd HH:mm:ss";
        return (function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
                "H+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            var week = {
                "0": "/u65e5",
                "1": "/u4e00",
                "2": "/u4e8c",
                "3": "/u4e09",
                "4": "/u56db",
                "5": "/u4e94",
                "6": "/u516d"
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            if (/(E+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }).call((date instanceof Date ? date : new Date(+date)), _fmt);
    },
    file: {
        icon: function (fileName, url, scale, className) {
            let index = 0;
            if (!fileName || !fileName.match) {
                index = 0;
            } else if (fileName.match(/\.docx?$/i)) {
                index = 1;
            } else if (fileName.match(/\.pptx?$/i)) {
                index = 2;
            } else if (fileName.match(/\.xlsx?$/i)) {
                index = 3;
            } else if (fileName.match(imageRegex)) {
                index = 4;
            } else if (fileName.match(videoRegex)) {
                index = 5;
            } else if (fileName.match(soundRegex)) {
                index = 6;
            } else if (fileName.match(/\.pdf$/i)) {
                index = 7;
            } else if (fileName.match(/\.(txt|md|rtf|tex|wps|csv)$/i)) {
                index = 8;
            } else if (fileName.match(/\.(zip|rar|7z|tar)$/i)) {
                index = 9;
            }
            return {
                html: `<div class="${className || ""}" style="width: ${scale}px; height: ${scale}px; overflow: hidden;"><img src="${url}" style="width: ${scale * 10}px; height: ${scale}px; margin-left: ${-index * scale}px;"/></div>`,
                component: (
                    <div class={className || ""}
                         style={`width: ${scale}px; height: ${scale}px; overflow: hidden;`}>
                        <img src={url}
                             style={`width: ${scale * 10}px; height: ${scale}px; margin-left: ${-index * scale}px;`}/>
                    </div>
                )
            }
        },
        size: function (size) {
            size = +size;
            if (isNaN(size) || size < 0) {
                return '';
            }
            if (size < 1000) {
                return `${"" + size.toFixed(2)} B`;
            } else if (size < Math.pow(2, 20)) {
                return `${(size / 1024).toFixed(2)} KB`;
            } else if (size < Math.pow(2, 30)) {
                return `${(size / Math.pow(2, 20)).toFixed(2)} MB`;
            } else if (size < Math.pow(2, 40)) {
                return `${(size / Math.pow(2, 30)).toFixed(2)} GB`;
            } else {
                return `${(size / Math.pow(2, 40)).toFixed(2)} TB`;
            }
        },
        type: function (fileName) {
            if (!fileName || !fileName.match) {
                return '';
            }
            const image = fileName.match(imageRegex);
            if (image) {
                return image[1].toLowerCase() + `图像文件`;
            }
            const doc = fileName.match(/\.(pdf|txt|doc|docx|ppt|pptx|xls|xlsx|csv|wps|md)$/i);
            if (doc) {
                return doc[1].toLowerCase() + `文档文件`;
            }
            const video = fileName.match(videoRegex);
            if (video) {
                return video[1].toLowerCase() + `视频文件`;
            }
            const other = fileName.match(/\.([a-zA-Z][a-zA-Z0-9]*)$/i);
            if (other) {
                return other[1].toLowerCase() + `文件`;
            } else {
                return `未知文件类型`;
            }
        }
    }

};