<?php
 
   $img = $_POST['img'];
   $id = $_POST['id'];
   
   if (strpos($img, 'data:image/png;base64') === 0) {
       
      $img = str_replace('data:image/png;base64,', '', $img);
      $img = str_replace(' ', '+', $img);
      $data = base64_decode($img);
      $filename = $id.'_'.date("YmdHisms");
      # $filename = uniqid('img', true);
		$file = 'uploads/'.$filename.'.png';

   
      if (file_put_contents($file, $data)) {
			// $cmd = '/var/www/cgi-bin/OpenFace/build/bin/FaceLandmarkImg -mloc /var/www/cgi-bin/OpenFace/build/bin/model/main_clm_general.txt -q -f ' . $file;
			$cmd = '/var/www/cgi-bin/OpenFace/build/bin/FaceLandmarkImg -mloc /var/www/cgi-bin/OpenFace/build/bin/model/main_clnf_multi_pie.txt -aus -tracked -q -f ' . $file;
			shell_exec($cmd);

			$path = 'processed/'.$filename.'.jpg';
			$openfacedata = file_get_contents($path);
			$type = pathinfo($path, PATHINFO_EXTENSION);
			$base64 = 'data:image/' . $type . ';base64,' . base64_encode($openfacedata);

			$path = 'processed/'.$filename.'.csv';
			if (($handle = fopen($path, "r")) !== FALSE) {
				$csvdata = fgetcsv($handle, 297, ",");
				$csvdata = array_slice(fgetcsv($handle, 1000, ","), 2, 17);
			}else{
				$csvdata = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			}

			$myObj->img = $base64;
			$myObj->fau = $csvdata;
			$myObj->id = $id;

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
			$myJSON = json_encode($myObj);
		 	echo $myJSON;
      }   
     
   } else {
	  $csvdata = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
		$myObj->img = 'images/defaultuser.png';
		$myObj->fau = $csvdata;
		$myJSON = json_encode($myObj);
		echo $myJSON;
	}
 
?>
