<?php
 
   $img = $_POST['img'];
   $id = preg_replace('/[\*]+/', '', $_POST['id']);
   $loopback = $_POST['loopback'];
   $timestamp = $_POST['time'];
   
   if (strpos($img, 'data:image/png;base64') === 0) {
       
      $img = str_replace('data:image/png;base64,', '', $img);
      $img = str_replace(' ', '+', $img);
      $data = base64_decode($img);
      $filename = $id.'_'.date("YmdHisms");
      $filename = uniqid('img', true);
		if (!file_exists('uploads/'.$id)) {
			mkdir('uploads/'.$id, 0755, true);
		}
		if (!file_exists('processed/'.$id)) {
			mkdir('processed/'.$id, 0755, true);
		}
		$file = 'uploads/'.$id.'/'.$filename.'.png';

   
      if (file_put_contents($file, $data)) {
			// $cmd = '/var/www/cgi-bin/OpenFace/build/bin/FaceLandmarkImg -mloc /var/www/cgi-bin/OpenFace/build/bin/model/main_clm_general.txt -q -f ' . $file;
			// $cmd = '/var/www/cgi-bin/OpenFace/build/bin/FaceLandmarkImg -mloc /var/www/cgi-bin/OpenFace/build/bin/model/main_clnf_multi_pie.txt -aus -tracked -q -out_dir processed/'.$id.' -f '.$file;
			$cmd = '/var/www/cgi-bin/OpenFace/build/bin/FaceLandmarkImg -mloc /var/www/cgi-bin/OpenFace/build/bin/model/main_clm_general.txt -aus -tracked -q -out_dir processed/'.$id.' -f '.$file;
			shell_exec($cmd);

			$path = 'processed/'.$id.'/'.$filename.'.jpg';
			$openfacedata = file_get_contents($path);
			$type = pathinfo($path, PATHINFO_EXTENSION);
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($openfacedata);

			$path = 'processed/'.$id.'/'.$filename.'.csv';
			if (($handle = fopen($path, "r")) !== FALSE) {
				$csvdata = fgetcsv($handle, 297, ",");
				$csvdata = array_slice(fgetcsv($handle, 1000, ","), 2, 17);
			}else{
				$csvdata = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			}

			if ($loopback > 0 && $base64) {
				$myObj->img = $base64;
			}else {
				$myObj->img = 'images/defaultuser.png';
			}
			$myObj->fau = $csvdata;
			$myObj->id = $id;
			$myObj->time = $timestamp;

			$myJSON = json_encode($myObj);
		 	echo $myJSON;
			# echo session_id() ;
			# $cmd = 'rm ' . $file;
			# shell_exec($cmd);
      } else {
			$base64 = 'data:image/png;base64,' . base64_encode($data);
		 	# echo $data;
			$csvdata = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			$myObj->img = $base64;
			$myObj->fau = $csvdata;
			$myObj->id = $id;
			$myObj->time = $timestamp;
			$myJSON = json_encode($myObj);
		 	echo $myJSON;
      }   
     
   } else {
	  $csvdata = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
		$myObj->img = 'images/defaultuser.png';
		$myObj->fau = $csvdata;
		$myObj->id = $id;
		$myObj->time = $timestamp;
		$myJSON = json_encode($myObj);
		echo $myJSON;
	}
 
?>
