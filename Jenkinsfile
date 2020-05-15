pipeline {
  agent {
    docker {
      image 'maven:3.6-alpine'
      args '-u root -v /data/jenkins/mvnrepo:/root/.m2'
    }

  }
  stages {
    stage('Pull Git Demo') {
      steps {
        git 'https://github.com/wxbing2015/solo.git'
      }
    }

    stage('Build') {
      steps {
        sh 'mvn -B -DskipTests clean package'
      }
    }

  }
}
