using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Move : MonoBehaviour {

    public float speed = 1;
    public float lateralLimit = 3;

    private Rigidbody2D body;
    private float height;

    private bool dropped = false;

    private void Start()
    {
        body = GetComponent<Rigidbody2D>();

        body.constraints = RigidbodyConstraints2D.FreezePositionY; // allow only horizontal movement
        body.velocity = new Vector2(speed, 0);  // start moving, constantly

        height = GetComponent<SpriteRenderer>().bounds.extents.y * 2 +
                 GetComponent<BoxCollider2D>().bounds.extents.y * 2;
        Debug.Log(height);
    }

    void Update () 
    {
        if (transform.position.x > lateralLimit) // abs and *-1 trick does not work because of small noise
            body.velocity = new Vector2(-speed, 0);
        if (transform.position.x < -lateralLimit)
            body.velocity = new Vector2(speed, 0);

        if (!dropped && Input.GetKeyDown(KeyCode.Space)) {
            dropped = true;

            // Make a new one
            Instantiate(
                this,
                position: new Vector3(lateralLimit, this.transform.position.y + height),
                rotation: Quaternion.identity
            );

            // Drop it
            body.constraints = RigidbodyConstraints2D.FreezePositionX | RigidbodyConstraints2D.FreezeRotation; // allow only vertical movement
        }
    }

    void OnCollisionEnter(Collision collision) {
        Destroy(GetComponent<Rigidbody2D>());
    }
}
