import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Response } from '@app/core/models';
import { environment } from '@env/environment';

@Injectable()
export class VimeoService {
    constructor(private http: HttpClient) {}

    /**
     * Create a new video on vimeo for uploading.
     */
    createNewVideo(redirectUri: string, name?: string): Observable<any>{
        let reqBody = {
            "upload" : {
                "approach" : "post",
                "redirect_url" : `${environment.websiteUrl}${redirectUri}`
            }
        }
        return this.http.post<any>('https://api.vimeo.com/me/videos', reqBody);
    }

    /**
     * Uplaod the video to the vimeo
     * @param uploadUrl Upload url from Create new video API field {upload.upload_link}
     * @param formData Form data with video file to upload
     */
    uploadVideo(uploadUrl: string, formData): Observable<any>{
        return this.http.post<any>(uploadUrl, formData);
    }

    /**
     * Get video data using video id
     */
    getVideoDataById(videoId: number): Observable<any> {
        return this.http.get(`https://api.vimeo.com/videos/${videoId}`);
    }

    /**
     * Get the current browser with version
     */
    getBrowserVersion(): string {
        var ua= navigator.userAgent, tem,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    }

}