import Keycloak from 'keycloak-js';

export class KeycloakService {
    keycloak: Keycloak;

    init(): Promise<void> {
        this.keycloak = new Keycloak({
            url: 'http://13.62.55.138:8080',
            realm: 'auditApp',
            clientId: 'audit-app',
        });

        return this.keycloak
            .init({
                onLoad: 'login-required',
                checkLoginIframe: false,
            })
            .then((authenticated) => {
                if (!authenticated) {
                    console.warn('Not authenticated!');
                }
            })
            .catch((err) => {
                console.error('Keycloak init failed', err);
            });
    }

    getToken(): string | undefined {
        return this.keycloak?.token;
    }

    getUserInfo() {
        const token = this.getToken();
        if (token) {
            // Décoder le payload du JWT
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                username: payload.preferred_username,
                name: payload.name,
                email: payload.email,
                givenName: payload.given_name,
                familyName: payload.family_name
            };
        }
        return null;
    }

    getUsername(): string | null {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.username : null;
    }
}
