// Jenkins Pipeline for Social Platform

pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['staging', 'production'],
            description: 'Target deployment environment'
        )
        booleanParam(
            name: 'DEPLOY_TO_ENV',
            defaultValue: false,
            description: 'Deploy to environment after build'
        )
        string(
            name: 'SERVICE_NAME',
            defaultValue: '',
            description: 'Service to build and deploy (leave empty for all)'
        )
    }
    
    environment {
        DOCKER_REGISTRY = 'registry.social-platform.com'
        KUBE_CONFIG_PATH = credentials('kubeconfig')
        SLACK_CHANNEL = 'deployments'
        SLACK_WEBHOOK_URL = credentials('slack-webhook')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test') {
            parallel {
                stage('Auth Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'auth-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/auth-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('User Profile Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'user-profile-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/user-profile-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('Websocket Signaling Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'websocket-signaling-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/websocket-signaling-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('Chat Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'chat-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/chat-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('Friend Request Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'friend-request-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/friend-request-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('Notification Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'notification-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/notification-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('Video Call Signaling Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'video-call-signaling-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/video-call-signaling-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
                
                stage('OTP Service Tests') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'otp-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/otp-service') {
                                sh 'npm ci'
                                sh 'npm run lint'
                                sh 'npm run test'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            when {
                expression { params.DEPLOY_TO_ENV }
            }
            parallel {
                stage('Build Auth Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'auth-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/auth-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/auth-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/auth-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/auth-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build User Profile Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'user-profile-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/user-profile-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/user-profile-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/user-profile-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/user-profile-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build Websocket Signaling Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'websocket-signaling-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/websocket-signaling-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/websocket-signaling-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/websocket-signaling-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/websocket-signaling-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build Chat Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'chat-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/chat-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/chat-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/chat-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/chat-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build Friend Request Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'friend-request-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/friend-request-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/friend-request-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/friend-request-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/friend-request-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build Notification Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'notification-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/notification-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/notification-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/notification-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/notification-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build Video Call Signaling Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'video-call-signaling-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/video-call-signaling-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/video-call-signaling-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/video-call-signaling-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/video-call-signaling-service:latest
                                """
                            }
                        }
                    }
                }
                
                stage('Build OTP Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'otp-service' }
                        }
                    }
                    steps {
                        script {
                            dir('apps/services/otp-service') {
                                sh """
                                docker build -t ${DOCKER_REGISTRY}/otp-service:\${BUILD_NUMBER} .
                                docker tag ${DOCKER_REGISTRY}/otp-service:\${BUILD_NUMBER} ${DOCKER_REGISTRY}/otp-service:latest
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            when {
                expression { params.DEPLOY_TO_ENV }
            }
            parallel {
                stage('Push Auth Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'auth-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/auth-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/auth-service:latest"
                    }
                }
                
                stage('Push User Profile Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'user-profile-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/user-profile-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/user-profile-service:latest"
                    }
                }
                
                stage('Push Websocket Signaling Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'websocket-signaling-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/websocket-signaling-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/websocket-signaling-service:latest"
                    }
                }
                
                stage('Push Chat Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'chat-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/chat-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/chat-service:latest"
                    }
                }
                
                stage('Push Friend Request Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'friend-request-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/friend-request-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/friend-request-service:latest"
                    }
                }
                
                stage('Push Notification Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'notification-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/notification-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/notification-service:latest"
                    }
                }
                
                stage('Push Video Call Signaling Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'video-call-signaling-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/video-call-signaling-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/video-call-signaling-service:latest"
                    }
                }
                
                stage('Push OTP Service') {
                    when {
                        anyOf {
                            expression { params.SERVICE_NAME == '' }
                            expression { params.SERVICE_NAME == 'otp-service' }
                        }
                        expression { params.DEPLOY_TO_ENV }
                    }
                    steps {
                        sh "docker push ${DOCKER_REGISTRY}/otp-service:\${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_REGISTRY}/otp-service:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Environment') {
            when {
                expression { params.DEPLOY_TO_ENV }
            }
            steps {
                script {
                    dir('infra/k8s') {
                        sh """
                        kubectl config use-context ${params.ENVIRONMENT}
                        kubectl set image deployment/auth-service auth-service=${DOCKER_REGISTRY}/auth-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/user-profile-service user-profile-service=${DOCKER_REGISTRY}/user-profile-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/websocket-signaling-service websocket-signaling-service=${DOCKER_REGISTRY}/websocket-signaling-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/chat-service chat-service=${DOCKER_REGISTRY}/chat-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/friend-request-service friend-request-service=${DOCKER_REGISTRY}/friend-request-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/notification-service notification-service=${DOCKER_REGISTRY}/notification-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/video-call-signaling-service video-call-signaling-service=${DOCKER_REGISTRY}/video-call-signaling-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        kubectl set image deployment/otp-service otp-service=${DOCKER_REGISTRY}/otp-service:\${BUILD_NUMBER} -n social-platform-${params.ENVIRONMENT}
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                if (params.DEPLOY_TO_ENV) {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'good',
                        message: "✅ Deployment successful to ${params.ENVIRONMENT} environment. Build #${BUILD_NUMBER}"
                    )
                } else {
                    slackSend(
                        channel: SLACK_CHANNEL,
                        color: 'good',
                        message: "✅ Build successful. Build #${BUILD_NUMBER}"
                    )
                }
            }
        }
        
        failure {
            slackSend(
                channel: SLACK_CHANNEL,
                color: 'danger',
                message: "❌ Build failed. Build #${BUILD_NUMBER}. Check logs for details."
            )
        }
        
        always {
            cleanWs()
        }
    }
}