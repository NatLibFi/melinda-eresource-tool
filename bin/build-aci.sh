#!/bin/bash
set -ex
ACBUILD_CMD="acbuild --no-history"

if [ -z $ACBUILD_ENGINE ];then
  ACBUILD_ENGINE="systemd-nspawn"
fi

ACI_OS="linux"
ACI_ARCH="amd64"
ACI_RELEASE="xenial"
ACI_NAME_DOMAIN="appc.cont-registry-kk.lib.helsinki.fi"
ACI_NAME_GROUP="melinda"
ACI_NAME="eresource-tool"
ACI_VERSION="1.0.0"

rm -rf aci-build
mkdir aci-build
cp -rp build aci-build/app
cp package.json aci-build/app/
cp -r aci-build/app/{commons,melinda-ui-commons}

cat <<EOF > aci-build/nodesource.list
deb https://deb.nodesource.com/node_7.x xenial main
deb-src https://deb.nodesource.com/node_7.x xenial main
EOF

cat <<EOF > aci-build/nodesource.pref
Explanation: apt: nodesource
Package: nodejs
Pin: release a=nodesource
Pin-Priority: 1000
EOF

$ACBUILD_CMD begin docker://ubuntu:xenial

$ACBUILD_CMD set-name "$ACI_NAME_DOMAIN/$ACI_NAME_GROUP/$ACI_NAME"
$ACBUILD_CMD label add version $ACI_VERSION
$ACBUILD_CMD label add os $ACI_OS
$ACBUILD_CMD label add arch $ACI_ARCH
$ACBUILD_CMD label add release $ACI_RELEASE

$ACBUILD_CMD set-working-directory /opt/melinda-eresource-tool/app
$ACBUILD_CMD set-exec -- /bin/bash -c '/usr/bin/node index.js 2>&1 | tee -a /opt/melinda-eresouce-tool/logs/melinda-eresouce-tool.log'

$ACBUILD_CMD mount add logs /opt/melinda-eresouce-tool/logs
$ACBUILD_CMD mount add --read-only conf /opt/melinda-eresource-tool/conf

$ACBUILD_CMD copy aci-build/app /opt/melinda-eresource-tool/app

if [ $ACBUILD_ENGINE == 'chroot' ];then
  $ACBUILD_CMD run --engine chroot -- /bin/bash -c "echo '$(grep -m1 -E ^nameserver /etc/resolv.conf)' > /etc/resolv.conf"
fi

$ACBUILD_CMD run --engine $ACBUILD_ENGINE -- /bin/bash -c 'apt-get -y update && apt-get -y install apt-transport-https curl git'
$ACBUILD_CMD run --engine $ACBUILD_ENGINE -- /bin/bash -c 'curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -'

$ACBUILD_CMD copy aci-build/nodesource.list /etc/apt/sources.list.d/nodesource.list
$ACBUILD_CMD copy aci-build/nodesource.pref /etc/apt/preferences.d/nodesource.pref

$ACBUILD_CMD run --engine $ACBUILD_ENGINE -- /bin/bash -c 'apt-get -y update && apt-get -y install nodejs'
$ACBUILD_CMD run --engine $ACBUILD_ENGINE --working-dir /opt/melinda-eresource-tool/app -- /bin/bash -c 'npm install --production'

$ACBUILD_CMD run --engine $ACBUILD_ENGINE -- /bin/bash -c 'apt-get -y update && apt-get -y install tzdata'
$ACBUILD_CMD run --engine $ACBUILD_ENGINE -- /bin/bash -c 'ln -fs /usr/share/zoneinfo/Europe/Helsinki /etc/localtime'

if [ $ACBUILD_ENGINE == 'chroot' ];then
  $ACBUILD_CMD run --engine chroot -- rm /etc/resolv.conf
fi

$ACBUILD_CMD write --overwrite "aci-build/$ACI_NAME_GROUP-$ACI_NAME-$ACI_OS-$ACI_ARCH-$ACI_DISTRO-$ACI_RELEASE-$ACI_VERSION.aci"
$ACBUILD_CMD end

chmod og+rx aci-build
