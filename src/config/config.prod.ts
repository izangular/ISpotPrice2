export class Config{
    public static readonly environment: any = [
        {
            PORTAL_ENV : 'dev',
            AUTH_HOST : 'https://devservices.iazi.ch/api/auth/v2',
            API_HOST: 'https://devams-api.iazi.ch',
            PORTAL_HOST: 'https://devmy.iazi.ch',
            COOKIE_DOMAIN : ''
        },
        {
            PORTAL_ENV : 'int',
            AUTH_HOST : 'https://intservices.iazi.ch/api/auth/v2',
            API_HOST: 'https://intams-api.iazi.ch',
            PORTAL_HOST: 'https://intmy.iazi.ch',
            COOKIE_DOMAIN : ''
        },
        {
            PORTAL_ENV : 'test',
            AUTH_HOST : 'https://testservices.iazi.ch/api/auth/v2',
            API_HOST: 'https://testams-api.iazi.ch',
            PORTAL_HOST: 'https://testmy.iazi.ch',
            COOKIE_DOMAIN : ''
        },
        {
            PORTAL_ENV : 'prod',
            AUTH_HOST : 'https://services.iazi.ch/api/auth/v2',
            API_HOST: 'https://ams-api.iazi.ch',
            PORTAL_HOST: 'https://my.iazi.ch',
            COOKIE_DOMAIN : ''
        }
    ];
}
