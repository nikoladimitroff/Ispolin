/// <reference path="../../typings/q/Q.d.ts" />

module Utils {

"use strict";

export function sendData(path: string,
                         verb: string,
                         body: any): Q.Promise<any> {
    let xhr = new XMLHttpRequest();
    let deferred = Q.defer<any>();
    xhr.onreadystatechange = function(): void {
        if (xhr.readyState === XMLHttpRequest.DONE ) {
            if (xhr.status === 200) {
                deferred.resolve(xhr);
            } else {
                let error = `Could not open ${path}. ` +
                            `Status code: ${xhr.status}`;
                console.error(error);
                deferred.reject(xhr);
            }
        }
    };
    xhr.open(verb, path, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body));

    return deferred.promise;
}

export function loadJSON<T>(path: string,
                            verb: string = "GET",
                            body: any = undefined): Q.Promise<T> {
    let deferred = Q.defer<T>();
    let onfulfill = (xhr: XMLHttpRequest) => {
        try {
            let obj = <T>(JSON.parse(xhr.responseText));
            deferred.resolve(obj);
        } catch (error) {
            console.error(error);
            deferred.reject(xhr);
        }
        return deferred.promise;
    };
    let onerror = (xhr: XMLHttpRequest) => {
        deferred.reject(xhr);
        return deferred.promise;
    };
    return sendData(path, verb, body).then(onfulfill, onerror);
};

export function stringEndsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

}
