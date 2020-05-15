pipeline {
    agent { //这里使用docker镜像来启动maven,这样有个好处就是多个工程同时构建时不会出现冲突而失败
        docker {
            image 'maven:3.6-alpine' 
            args '-u root -v /home/jenkins/mvnrepo:/root/.m2'  //持载到本地，减少重复下载量，使用ali源
        }
    }
    stages {
        stage('Pull Git Demo') {
            steps{
                //拉取代码
            	git 'https://github.com/hellxz/springboot-demo1.git'
            }
        }
        stage('Build') { 
            steps {
                //执行构建命令
                sh 'mvn -B -DskipTests clean package' 
            }
        }
    }
}
