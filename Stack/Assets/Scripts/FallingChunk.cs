using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FallingChunk : MonoBehaviour {

    public float speed = 5;
    float screenBottom;

    void Start()
    {
        Destroy(this.gameObject, 3);  // in seconds
    }

    void Update () 
    {
        transform.position -= new Vector3(0, speed * Time.deltaTime, 0);
	}
}
