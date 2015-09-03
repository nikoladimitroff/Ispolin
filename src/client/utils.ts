/// <reference path="../../typings/q/Q.d.ts" />

module Utils {

"use strict";

export function loadJSON<T>(path: string,
                            verb: string = "GET"): Q.Promise<T> {
    let xhr = new XMLHttpRequest();
    let deferred = Q.defer<T>();
    xhr.onreadystatechange = function(): void {
        if (xhr.readyState === XMLHttpRequest.DONE ) {
            if (xhr.status === 200) {
                try {
                    let obj = <T>(JSON.parse(xhr.responseText));
                    deferred.resolve(obj);
                } catch (error) {
                    deferred.reject(error);
                }
            } else {
                let error = "Could not load ${path}. " +
                            "Status code: ${xhr.status}";
                deferred.reject(new Error(error));
            }
        }
    };
    xhr.open(verb, path, true);
    xhr.send();

    return deferred.promise;
};

}
