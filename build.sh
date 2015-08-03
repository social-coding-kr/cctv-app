pushd cctvApp

mkdir -p buildlog
ionic build android > buildlog/lastbuild.log
cat buildlog/lastbuild.log
grep "BUILD SUCCESS" buildlog/lastbuild.log

exit $?